# FRONTEND - RUSH
*Tương tác giữa tầng giao diện và tầng điều phối*

---
## Cấu trúc thư mục cơ bản
*Dự án Tauri thường được chia thành 2 phần, thư mục Rust và thư mục Javascript (optional) với kiến trúc thông thường sẽ như sau

    .
    ├── package.json
    ├── index.html
    ├── src/
    │   ├── main.js
    ├── src-tauri/
    │   ├── Cargo.toml
    │   ├── Cargo.lock
    │   ├── build.rs
    │   ├── tauri.conf.json
    │   ├── src/
    │   │   ├── main.rs
    │   │   └── lib.rs
    │   ├── icons/
    │   │   ├── icon.png
    │   │   ├── icon.icns
    │   │   └── icon.ico
    │   └── capabilities/
    │       └── default.json

`tauri.conf.json`: Là file cấu hình chính của Tauri, chứa mọi thứ từ mã định danh ứng dụng (identifier) cho đến URL của máy chủ phát triển (dev server). File này cũng đóng vai trò là "dấu mốc" để Tauri CLI tìm thấy dự án Rust. Để tìm hiểu thêm, hãy xem phần Tauri Config.

Thư mục `capabilities/`: Là thư mục mặc định nơi Tauri đọc các file phân quyền (nói ngắn gọn, bạn cần cấp phép các lệnh tại đây để có thể sử dụng chúng trong mã JavaScript). Để tìm hiểu thêm, hãy xem phần Security.

Thư mục `icons/`: Là thư mục đầu ra mặc định của lệnh tauri icon. Nó thường được tham chiếu trong tauri.conf.json > bundle > icon và được dùng làm các biểu tượng cho ứng dụng.

`build.rs`: Chứa hàm `tauri_build::build()`, hàm này được sử dụng cho hệ thống đóng gói (build system) của Tauri.

`src/lib.rs`: Chứa mã nguồn Rust và điểm khởi đầu cho phiên bản di động (hàm được đánh dấu với #[cfg_attr(mobile, tauri::mobile_entry_point)]). Lý do chúng ta không viết trực tiếp vào main.rs là vì trên các bản build cho di động, ứng dụng sẽ được biên dịch thành một thư viện và được tải thông qua các khung phần mềm (framework) của nền tảng đó.

`src/main.rs`: Là điểm khởi đầu chính cho phiên bản máy tính (desktop). Chúng ta chạy lệnh app_lib::run() trong hàm main để sử dụng cùng một điểm khởi đầu như bản di động. Vì vậy, để giữ mọi thứ đơn giản, đừng sửa đổi file này, hãy sửa file lib.rs thay thế. Lưu ý rằng app_lib tương ứng với tên được đặt trong mục [lib.name] ở file Cargo.toml.

*Tauri hoạt động tương tự như một trình lưu trữ web tĩnh (static web host). Cách nó đóng gói (build) là bạn sẽ biên dịch dự án JavaScript thành các file tĩnh trước, sau đó mới biên dịch dự án Rust để đóng gói (bundle) các file tĩnh đó vào bên trong.*

## [Gọi mã Rust từ Frontend](https://tauri.app/develop/calling-rust/)

### Commands
*Tauri cung cấp một hệ thống lệnh (command) đơn giản nhưng mạnh mẽ để gọi các hàm Rust từ ứng dụng web của bạn. Các lệnh này có thể nhận đối số và trả về giá trị. chúng cũng có khả năng trả về lỗi và hoạt động theo cơ chế bất đồng bộ (async).*

Các Command có thể được định nghĩa trong file `src-tauri/src/lib.rs`. Để tạo một command, chỉ cần thêm một hàm và đánh dấu nó với thuộc tính `#[tauri::command]`
```python
#[tauri::command]
fn my_custom_command() {
  println!("I was invoked from JavaScript!");
}
```
>Tên command phải là độc nhất
>Các Command được định nghĩa trong file lib.rs không thể đánh dấu là pub (công khai) do một hạn chế trong quá trình tự động tạo mã liên kết (glue code generation). Bạn sẽ thấy một lỗi tương tự như thế này nếu bạn đánh dấu nó là một hàm công khai (public function)

```python 
error[E0255]: the name `__cmd__command_name` is defined multiple times
  --> src/lib.rs:28:8
   |
27 | #[tauri::command]
   | ----------------- previous definition of the macro `__cmd__command_name` here
28 | pub fn x() {}
   |        ^ `__cmd__command_name` reimported here
   |
   = note: `__cmd__command_name` must be defined only once in the macro namespace of this module
```

>Bạn sẽ phải cung cấp một danh sách các command của mình cho hàm builder như sau:
```python
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```
và bạn có thể gọi command từ javascript như sau:
```javascript
// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/core';

// When using the Tauri global script (if not using the npm package)
// Be sure to set `app.withGlobalTauri` in `tauri.conf.json` to true
const invoke = window.__TAURI__.core.invoke;

// Invoke the command
invoke('my_custom_command');
```
##### Định nghĩa các Command trong một Module riêng biệt

##### WASM

##### Đối số truyền vào

##### Dữ liệu trả về

##### Xử lý lỗi

##### Async Commands

### Even System

---

## [Gọi Frontend từ mã Rust](https://tauri.app/develop/calling-frontend/)