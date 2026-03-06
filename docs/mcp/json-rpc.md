# JSON-RPC
*Viết tắt của JavaScript Object Notation - Remote Procedure Call*

```json-rpc2.0
{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}
```
>Đoạn mã này thực hiện gửi 1 yêu cầu khởi tạo để thiết lập kết nối giữa client và MCP Server

**Cấu trúc cơ bản của `JSON-RPC`**
- `jsonrpc`: Định nghĩa phiên bản của giao thức JSON-RPC đang sử dụng. Đây là tiêu chuẩn bắt buộc để các bên hiểu cách giao tiếp với nhau.
- `id`: Một mã định danh duy nhất cho mỗi yêu cầu. Nó giúp client biết được phản hồi (response) nào tương ứng với yêu cầu nào khi có nhiều yêu cầu gửi đi cùng lúc.
- `method`: Tên của hành động mà bạn muốn thực hiện. "initialize" là phương thức đầu tiên luôn được gọi để bắt đầu một "phiên làm việc" giữa client và server.
- `params`: Nơi chứa dữ liệu cụ thể để cấu hình kết nối
    - `protocolVersion`: Phiên bản của giao thức MCP (Model Context Protocol) mà client đang sử dụng. Server sẽ kiểm tra xem nó có hỗ trợ phiên bản này không trước khi đồng ý kết nối.
    - `capabilities`: Đây là một đối tượng (object) rỗng trong ví dụ của bạn. Thực tế, nó dùng để thông báo cho server biết client có thể làm được những gì (ví dụ: hỗ trợ lưu vết log, hỗ trợ các công cụ thử nghiệm, v.v.).
    - `clientInfo`: Thông tin định danh về phần mềm đang đóng vai trò là client:
    - `name`: Tên của client ("test-client").
    - `version`: Phiên bản của client ("1.0.0").

# Cấu trúc một Request

- `jsonrpc`: `2.0`  
- `method`: Một chuỗi (string) tên phương thức muốn thực thi. Trong MCP, các phương thức phổ biến bao gồm:
    - `resources/list`: Liệt kê các tài nguyên.
    - `prompts/get`: Lấy một mẫu câu lệnh.
    - `tools/call`: Yêu cầu thực thi một công cụ cụ thể.
- `params`: Một đối tượng (Object) chứa các dữ liệu cần thiết để thực hiện phương thức đó.
    - *Ví dụ: Nếu gọi tools/call, params sẽ chứa name của tool và các đối số (arguments) đi kèm.*
- `id`: Một mã định danh. Nó giúp Client khớp phản hồi (Response) với đúng yêu cầu đã gửi, vì giao tiếp này thường là bất đồng bộ.

# Cấu trúc một Response

- `jsonrpc`: `2.0`
- `result`: Chứa dữ liệu trả về nếu yêu cầu thành công.
    - *Trong MCP, nếu gọi một Tool, result sẽ chứa mảng content (văn bản, hình ảnh, v.v.).*
- `error`: Xuất hiện nếu yêu cầu thất bại.
    - `code`: Mã lỗi số.
    - `message`: Thông báo lỗi ngắn gọn.
    - `data`: Thông tin chi tiết bổ sung (tùy chọn).
- `id`: Phải trùng khớp với id của Request tương ứng.