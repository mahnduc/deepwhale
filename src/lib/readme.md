# SYSTEM DESIGN

Singleton  
Xây dựng một đối tượng duy nhất thao tác vào Root của OPFS
- Vai trò: Đảm bảo chỉ có một thực thể duy nhất của OPFSManager tồn tại trong một vòng đời

Strategy  
Xử lý dữ liệu đầu vào
- Vai trò: Tách rời thuật toán khỏi logic chính, định nghĩa strategy(chiến lược) cho từng loại file(.txt, .pdf,...)

Observer  
Khi một tệp được thêm vào hoặc xóa đi thông qua Engine (tầng dưới), UI sẽ cập nhật thông qua cơ chế "Đăng ký - Thông báo"
- Vai trò: Thiết lập cơ chế "Đăng ký - Thông báo". Engine là bên bị quan sát (Subject), và các thành phần UI là bên quan sát (Observers).


<!-- Hệ thống quản lý tệp trong OPFS với TypeScript sử dụng mô hình Service-Repository kết hợp với Adapter Pattern.

        src/
        └── lib/
            └── opfs/
                ├── types.ts          // Định nghĩa interface & types
                ├── utils.ts          // Helper xử lý path (split, join)
                ├── OpfsCore.ts       // Singleton khởi tạo root, chịu trách nhiệm thực hiện kết nối cật lý với trình duyệt
                ├── OpfsRepository.ts // Các thao tác CRUD nguyên tử, chịu trách nhiệm quản lý danh mục và các thao tác cơ bản
                └── index.ts          // Public API cho ứng dụng


|Hành động của người dùng|Logic trong Code|
|------------------------|----------------|
|Tạo file mới|Gọi writeFile với path mới và nội dung|
|Đọc nội dung|Gọi readFile để lấy File object|
|Sửa nội dung|1. Gọi readFile lấy text.<br>2. Sửa text trong JS.<br>3. Gọi writeFile với cùng một path để ghi đè|
|Xóa file|Gọi deleteEntry với path của file đó|

CREATE -> write
READ -> read
UPDATE -> write (override)
DELETE -> delete -->