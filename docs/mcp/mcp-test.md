# **CLI Test**

##### Khởi tạo MCP

    {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}

##### Gửi lệnh gọi tool (Request)

    {"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "say_hello", "arguments": {"name": "Duc"}}}

##### Kết quả trả về (Response)
    {"jsonrpc":"2.0","id":2,"result":{"content":[{"type":"text","text":"Chào Duc! Chúc bạn một ngày tốt lành."}],"structuredContent":{"result":"Chào Duc! Chúc bạn một ngày tốt lành."},"isError":false}} 

# [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)

    npx @modelcontextprotocol/inspector python src/main.py  
