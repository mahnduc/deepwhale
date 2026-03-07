# [MCP SERVER](https://modelcontextprotocol.io/docs/develop/build-server) 
*Xây dựng MCP Server với Python*

## Logging trong MCP Server
**Đối với server sử dựng `stdio`**: Tuyệt đối không bao giờ ghi dữ liệu vào `stdout`. Việc ghi vào stdout sẽ làm sai lệch các thông điệp [JSON-RPC](https://www.jsonrpc.org/specification) và gây hỏng server của bạn. Hàm `print()` mặc định sẽ ghi vào stdout, nhưng bạn có thể sử dụng nó một cách an toàn bằng cách thêm tham số `file=sys.stderr`.  
>*Chi tiết cách sử dụng logging trong dự án tại [đây](engine/log.md)*  

Ví dụ
```python
import sys
import logging

# ❌ Bad (STDIO)
print("Processing request")

# ✅ Good (STDIO)
print("Processing request", file=sys.stderr)

# ✅ Good (STDIO)
logging.info("Processing request")
```

## **Công cụ kiểm thử**  
*Các công cụ kiểm thử đề xuất*

---
#### **CLI**  
**Bước 1:** Chạy file cấu hình gốc  
```cmd
py main.py
```
**Bước 2:** Tạo Handshake (Gói tin khởi tạo)  
```json minified
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"my-cli","version":"1.0.0"}}}
```
<!-- **Bước 3:** Gửi gói tin xác nhận  
```json minified
{"jsonrpc":"2.0","method":"notifications/initialized","params":{}}
``` -->
**Bước 3:** Gọi tool (Tool Call)  
*ví dụ: gọi đến tool send_chat_message để gửi đến một tin nhắn*
```json minified
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"send_chat_message","arguments":{"user_name":"UserCLI","message":"Chào server, tôi đã kết nối thành công!","room":"General"}}}
```
---
#### **[MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)**

	npx @modelcontextprotocol/inspector python server.py