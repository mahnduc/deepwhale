use tauri::State;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use std::sync::Arc;
use tokio::sync::{Mutex, oneshot};
use std::collections::HashMap;
use serde::Serialize;
use tauri::{Manager};

#[derive(Serialize)]
struct JsonRpcRequest {
    jsonrpc: String,
    method: String,
    params: serde_json::Value,
    id: u64,
}

struct MCPState {
    child: Arc<Mutex<Option<CommandChild>>>,
    pending_requests: Arc<Mutex<HashMap<u64, oneshot::Sender<serde_json::Value>>>>,
    request_counter: Arc<Mutex<u64>>,
}

#[tauri::command]
async fn call_mcp(
    state: State<'_, MCPState>,
    method: String,
    params: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let id = {
        let mut counter = state.request_counter.lock().await;
        *counter += 1;
        *counter
    };

    let (tx, rx) = oneshot::channel();
    state.pending_requests.lock().await.insert(id, tx);

    let request = JsonRpcRequest {
        jsonrpc: "2.0".to_string(),
        method,
        params,
        id,
    };

    let payload = serde_json::to_string(&request).map_err(|e| e.to_string())?;
    
    let mut child_lock = state.child.lock().await;
    if let Some(child) = child_lock.as_mut() {
        // Gửi payload kèm xuống dòng
        if let Err(e) = child.write(format!("{}\n", payload).as_bytes()) {
            state.pending_requests.lock().await.remove(&id);
            return Err(format!("Lỗi ghi: {}. Kiểm tra log Python!", e));
        }
    } else {
        return Err("MCP Server chưa khởi động".into());
    }
    drop(child_lock);

    match tokio::time::timeout(std::time::Duration::from_secs(15), rx).await {
        Ok(Ok(res)) => Ok(res),
        Ok(Err(_)) => Err("Kết nối bị đóng".to_string()),
        Err(_) => {
            state.pending_requests.lock().await.remove(&id);
            Err("Timeout - Server không phản hồi".to_string())
        },
    }
}

// tạo splash screen
#[tauri::command]
async fn close_splashscreen(app: tauri::AppHandle) {
    // Lấy cửa sổ chính
    let main_window = app.get_webview_window("main").unwrap();
    // Lấy cửa sổ splashscreen
    let splash_window = app.get_webview_window("splashscreen").unwrap();

    // Hiện main và đóng splash
    main_window.show().unwrap();
    splash_window.close().unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let child_arc = Arc::new(Mutex::new(None));
    let pending_requests = Arc::new(Mutex::new(HashMap::new()));
    
    let pending_requests_clone = Arc::clone(&pending_requests);
    let child_arc_clone = Arc::clone(&child_arc);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(MCPState {
            child: child_arc,
            pending_requests,
            request_counter: Arc::new(Mutex::new(0)),
        })
        .setup(move |app| {
            let sidecar_command = app.shell().sidecar("main").expect("Sidecar 'main' not found");
            let (mut rx, mut child) = sidecar_command.spawn().expect("Failed to spawn Python");

            // --- BƯỚC QUAN TRỌNG: Gửi initialize ngay lập tức ---
            let init_msg = r#"{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"tauri-client","version":"1.0.0"}}}"#;
            let _ = child.write(format!("{}\n", init_msg).as_bytes());

            let child_arc_for_setup = Arc::clone(&child_arc_clone);
            tauri::async_runtime::spawn(async move {
                *child_arc_for_setup.lock().await = Some(child);
            });

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            let out = String::from_utf8_lossy(&line);
                            for raw_json in out.lines() {
                                if let Ok(response) = serde_json::from_str::<serde_json::Value>(raw_json) {
                                    if let Some(id) = response.get("id").and_then(|v| v.as_u64()) {
                                        // Bỏ qua id 0 (phản hồi initialize)
                                        if id != 0 {
                                            if let Some(tx) = pending_requests_clone.lock().await.remove(&id) {
                                                let _ = tx.send(response);
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        CommandEvent::Stderr(line) => {
                            eprintln!("[PYTHON]: {}", String::from_utf8_lossy(&line));
                        },
                        _ => {}
                    }
                }
            });

            Ok(())
        })
        // đăng ký command
        .invoke_handler(tauri::generate_handler![call_mcp, close_splashscreen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}