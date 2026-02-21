# Thiết lập giao tiếp hai chiều giữa giao diện người dùng (Frontend) của Tauri và một tiến trình Python chạy ngầm (Sidecar).

## Khởi tạo State để quản lý tiến trình
    struct PythonProcess(Arc<Mutex<Option<CommandChild>>>);

`CommandChild`: Đại diện cho tiến trình Python đang chạy.

`Mutex` & `Arc`: Vì Tauri xử lý đa luồng, chúng ta cần `Mutex` để đảm bảo chỉ một luồng có thể thay đổi tiến trình tại một thời điểm, và `Arc` để chia sẻ quyền sở hữu dữ liệu này giữa các luồng khác nhau.

`Option`: Ban đầu khi app mới mở, tiến trình chưa chạy nên nó là `None`.

## Thiết lập Sidecar trong hàm `setup`

`sidecar("main")`: Tìm tệp thực thi Python đã được cấu hình trong `tauri.conf.json` với tên là `main`.

`spawn()`: Khởi chạy tiến trình đó. Nó trả về:

- `child`: Đối tượng để ta điều khiển tiến trình (như ghi dữ liệu vào `stdin`).

- `rx`: Một bộ thu (receiver) để lắng nghe các sự kiện từ tiến trình đó (`stdout`, `stderr`).  
**Lưu trữ Child**: Một luồng (spawn) được tạo ra để đưa child vào PythonProcess state, giúp các hàm khác có thể truy cập sau này.

## Lắng nghe phản hồi từ Python (`Stdout`)
```python
tauri::async_runtime::spawn(async move {
    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line) = event {
            let out = String::from_utf8_lossy(&line);
            let _ = app_handle.emit("python-response", out.trim());
        }
    }
});
```
*Đoạn mã này chạy một vòng lặp vô tận trong nền.*  
Mỗi khi Python in ra thứ gì đó (`print(...)`), Tauri sẽ bắt lấy dòng đó qua `Stdout`.  
`app_handle.emit`: Gửi dữ liệu này ngược về phía Frontend (JavaScript/TypeScript). Frontend chỉ cần lắng nghe sự kiện "python-response".

## Gửi dữ liệu từ Frontend xuống Python (`Stdin`)
```python
#[tauri::command]
async fn send_to_python(state: State<'_, PythonProcess>, input: String) -> Result<(), String> {
    let mut lock = state.0.lock().await;
    if let Some(child) = lock.as_mut() {
        child.write(format!("{}\n", input).as_bytes())
            .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Python sidecar chưa khởi chạy".to_string())
    }
}
```
Đây là một **invokable command**. Khi thực hiện gọi từ JS: `invoke('send_to_python', { input: '...' })`.

Nó truy cập vào **state** để lấy tiến trình Python đang chạy.

`child.write`: Ghi dữ liệu vào `stdin` của Python. Để Python nhận được, bạn thường cần thêm ký tự xuống dòng `\n`.

>LƯU Ý
- Đảm bảo khai báo sidecar trong `src-tauri/tauri.conf.json`.
