# [MCP SERVER](https://modelcontextprotocol.io/docs/develop/build-server) 
*Xây dựng MCP Server với Python*

## Khái niệm cốt lõi của MCP
`Resources`: *Các dữ liệu dạng tệp mà client có thể đọc được (như phản hồi từ API hoặc nội dung tệp tin).*   
`Tools`: *Các hàm (functions) mà mô hình ngôn ngữ lớn (LLM) có thể gọi thực thi (sau khi được người dùng chấp thuận).*  
`Prompts`: *Các mẫu (templates) được viết sẵn giúp người dùng hoàn thành các tác vụ cụ thể một cách dễ dàng hơn.*

## Logging trong MCP Server

**Đối với các server chạy trên STDIO**: *Tuyệt đối không bao giờ ghi dữ liệu vào `stdout`. Việc ghi vào stdout sẽ làm sai lệch các thông điệp [JSON-RPC](https://www.jsonrpc.org/specification) và gây hỏng server của bạn. Hàm `print()` mặc định sẽ ghi vào stdout, nhưng bạn có thể sử dụng nó một cách an toàn bằng cách thêm tham số `file=sys.stderr`.*

**Đối với các server chạy trên HTTP**: *Việc logging ra đầu ra tiêu chuẩn (stdout) là hoàn toàn bình thường vì nó không gây can thiệp hay ảnh hưởng đến các phản hồi (responses) HTTP.*

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

## Thiết lập môi trường
Cài đặt uv và thiết lập dự án cũng như môi trường Python

*Lệnh cài uv cho window:*

    powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

*Hãy đảm bảo khởi động lại terminal sau đó để chắc chắn rằng lệnh uv đã được hệ thống nhận diện.*

```python
# Create a new directory for our project
uv init [project-name]
cd [project-name]

# Create virtual environment and activate it
uv venv
.venv\Scripts\activate

# Install dependencies
uv add mcp[cli] httpx

# Create our server file
new-item server.py
```
## Xây dựng server của bạn

### Khai báo thư viện và thiết lập đối tượng

```python
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("weather")

# Constants
NWS_API_BASE = "https://api.weather.gov"
USER_AGENT = "weather-app/1.0"
```

### Hàm Tiện ích (Helper functions)

### Triển khai công cụ thực thi

### Khởi động server
```python
def main():
    # Initialize and run the server
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
```

## Kiểm thử
[MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) *(Công cụ kiểm thử)*

	npx @modelcontextprotocol/inspector python server.py