# [Tauri](https://tauri.app/) với FastMCP Python Sidecar

Cài đặt nhanh với:

    npm create tauri-app@latest

>`npm`,`React`,`TypeScript`

## Cấu hình src-tauri\tauri.conf.json
Thêm `externalBin` cho `bundle`

    "bundle": {
        "externalBin": [
            "binaries/main" 
        ]
    }

*`binaries/main` thực hiện khai báo và chạy file nhị phân phụ `main` (cơ chế sidecar).*

## Cấu hình src-tauri\capabilities\default.json

Thiết lập `permission`

    "permissions": [
        "core:default",
        "opener:default",
        {
            "identifier": "shell:allow-execute",
            "allow": [
                {
                    "name": "binaries/main",
                    "sidecar": true
                }
            ]
        },
        "shell:allow-open"
    ]

##### **Thiết lập quyền cơ bản**
`core:default`: Cấp các quyền cơ bản nhất để ứng dụng Tauri có thể khởi chạy và hoạt động.

`opener:default`: Cho phép ứng dụng sử dụng các lệnh mặc định để mở file hoặc URL bằng ứng dụng mặc định trên máy tính (ví dụ: click vào link web thì tự mở trình duyệt Chrome/Safari).

`"shell:allow-open"`: Quyền này cho phép ứng dụng sử dụng lệnh shell.open. Nó khác với execute ở chỗ: open dùng để mở một file/thư mục bằng chương trình có sẵn của hệ thống (như mở một file .txt bằng Notepad), còn execute là trực tiếp chạy một file thực thi.

##### **Khối cấu hình `"shell:allow-execute"`** 
*Đây là nơi cấp quyền cụ thể để ứng dụng có thể thực thi (chạy) một file nhị phân bên ngoài.*

`"name": "binaries/main"`: Xác định tên định danh của file nhị phân mà bạn đã khai báo trong phần externalBin trước đó.

`"sidecar": true`: Xác nhận đây là một tệp Sidecar.

>Nếu thiếu đoạn này, dù có để file main trong bộ cài, ứng dụng cũng sẽ bị hệ thống chặn không cho phép chạy vì lý do bảo mật (tránh việc mã độc tự ý thực thi các file lạ).

>xem thêm: [Nguyên tắc đặc quyền tối thiểu (Principle of Least Privilege)]()

## Cấu hình **src-tauri\Cargo.toml**
*File cấu hình cho công cụ build của Rust*

##### **[package] (Thông tin dự án)**
*Định nghĩa các thuộc tính cơ bản của ứng dụng*  
`name`: Tên định danh của dự án trong hệ thống Rust  
`version`:  Phiên bản hiện tại của ứng dụng  
`edition`: Tiêu chuẩn phiên bản của Rust  

##### **[lib] (Cấu hình thư viện)**
`name`: Tên thư viện.  
`crate-type = [...]`: Định nghĩa các kiểu file mà Rust sẽ tạo ra khi biên dịch
- `staticlib`: Thư viện tĩnh (dùng để liên kết vào file thực thi).
- `cdylib`: Thư viện năng động (dùng nếu muốn các ngôn ngữ khác gọi vào Rust).
- `rlib`: Thư viện chuẩn của Rust.  

##### **[build-dependencies] (Công cụ hỗ trợ biên dịch)**
`tauri-build`: Đây là một script chạy trước khi ứng dụng được biên dịch chính thức. Nó có nhiệm vụ chuẩn bị các tài nguyên của Tauri (như icon, cấu hình bảo mật) để sẵn sàng nhúng vào file .exe/.app. 

##### **[dependencies] (Các thư viện sử dụng trong mã nguồn)**
`tauri`: Thư viện lõi của Tauri v2.  
`tauri-plugin-shell`: Thư viện cho phép chạy các lệnh hệ thống hoặc file thực thi bên ngoài (`binaries/main`).  
`tauri-plugin-opener`: Cho phép mở các URL hoặc file bằng ứng dụng mặc định của hệ điều hành.  
`serde & serde_json`: Dùng để "Dịch" dữ liệu từ dạng `JSON` sang dạng dữ liệu mà `Rust` hiểu được và ngược lại.  
`tokio`: Cho phép Rust chạy các tác vụ Bất đồng bộ (Async). `Features = ["full"]`: Bật toàn bộ sức mạnh của Tokio (quản lý luồng, thời gian, mạng lưới...). Điều này giúp app không bị "đơ" giao diện khi đang xử lý tác vụ nặng ở Backend.

## Cấu trúc thư mục **src-tauri\src**

    src-tauri/
    └── src/
        ├── main.rs
        └── lib.rs

##### `main.rs`: Điểm khởi chạy (entry point) của ứng dụng

    // Prevents additional console window on Windows in release, DO NOT REMOVE!!
    #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

    fn main() {
        app_lib::run()
    }

##### `lib.rs`: Nơi cấu hình app và đăng ký command
chi tiết cấu hình *[tại đây](tutorial/lib.rs.md)*

## **Giao diện (TSX) tương tác với logic Backend (Rust)**
##### Cơ chế kết nối chính `invoke`

    const response = await invoke<McpResponse>("call_mcp", { ... });

`invoke`: Đây là hàm "cầu nối" (Bridge). Nó gửi một thông điệp từ trình duyệt (Webview) xuống nhân hệ điều hành (Rust).

`"call_mcp"`: Đây là tên của hàm Rust bạn đã đánh dấu với #[tauri::command]. Tauri sẽ dựa vào tên này để biết phải chạy đoạn code nào ở Backend.

`Tham số (Payload)`: Các object như method và params sẽ được tự động chuyển thành chuỗi JSON. Khi xuống đến Rust, thư viện serde mà bạn đã cấu hình trong Cargo.toml sẽ giải mã chúng thành các Struct tương ứng.

##### **Định nghĩa dữ liệu (Interface McpResponse)**
>Dùng chuẩn JSON-RPC 2.0 và giao thức MCP (Model Context Protocol).

## Thiết lập Splash screen

**Cấu hình window:**

    "windows": [
        {
            "label": "main",
            "title": "app",
            "width": 1280,
            "height": 720,
            "center": true,
            "visible": false
        },
        {
            "label": "splashscreen",
            "title": "Đang khởi động...",
            "width": 400,
            "height": 300,
            "decorations": false,
            "center": true,
            "url": "splashscreen.html"
        }
    ],

**Tạo cửa sổ hiển thị splashscreen tại `public/splashscreen.html`**

```html
<style>
  body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #1a1a1a;
    color: white;
    font-family: sans-serif;
  }
</style>

<div style="text-align: center;">
  <div class="loader"></div>
  <p>Đang tải ứng dụng...</p>
</div>
```
**Khai báo command trong lib.rs**

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

>Thực hiện đăng ký hàm trong `invoke_handle()`

    .invoke_handler(tauri::generate_handler![close_splashscreen])

**Đóng splashscreen bằng Frontend-Triggered**

```typescript
const closeSplash = async () => {
  try {
    setTimeout(async () => {
      await invoke("close_splashscreen");
    }, 500);
  } catch (err) { ... }
};
```

**Quy trình hoạt động và xử lý splashscreen**

|Bước|Thành phần|Trạng thái|Hành động|
|:-|:-|:-|:-|
|1|`Tauri Core`|**Khởi động**|Mở cửa sổ `splashscreen` (hiện), giữ cửa sổ `main` (ẩn).|
|2|`React App`|**Loading**|React bắt đầu render các phần tử Fluent UI vào cửa sổ `main`.|
|3|`useEffect`|**Trigger**|Ngay khi `main` đã vẽ xong giao diện, lệnh `invoke` được gửi đi.|
|4|`Rust Backend`|**Execute**|Rust nhận lệnh chạy hàm `close_splashscreen` để hoán đổi: `main.show()` và `splash.close()`.|

## Tailwind CSS cho UI APP
**Lệnh cài đặt**

    npm install tailwindcss @tailwindcss/vite

**Thêm plugin vào vite.config.ts**

    import tailwindcss from "@tailwindcss/vite";
    plugins: [
        tailwindcss(),
    ],