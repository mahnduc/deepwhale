# Command là gì?
**Command** giống như một "**chiếc cầu**" cho phép Frontend (`React/JS`) gọi điện xuống Backend (`Rust`) để yêu cầu thực hiện những việc mà webview không thể tự làm được.  
Một command có 3 đặc điểm nhận dạng sau:
>Macro `#[tauri::command]`  
*Dòng này đứng ngay phía trên hàm Rust. Nó đóng vai trò "đánh dấu" cho Tauri biết rằng: "Này, hàm này không phải hàm Rust bình thường đâu, hãy cho phép TypeScript bên ngoài có thể gọi được nó nhé!"*

>Đăng ký trong `invoke_handler()`  
*Để Command thực sự hoạt động, bạn phải khai báo nó trong file lib.rs*
`.invoke_handler(tauri::generate_handler![close_splashscreen])`

>Cách gọi từ Frontend bằng `invoke`  
*Bên phía React, bạn sử dụng hàm `invoke()` để "bấm nút" kích hoạt Command đó:*
`await invoke("close_splashscreen");`