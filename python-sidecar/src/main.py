import logging
import sys
import os
from fastmcp import FastMCP

# 1. Xác định đường dẫn file log tuyệt đối
log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mcp_server.log")

# 2. Cấu hình Logging với encoding='utf-8' để đọc được tiếng Việt
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    filename=log_path,
    filemode="w",
    encoding="utf-8"  # Ép cứng dùng UTF-8 ở đây
)

mcp = FastMCP(
    name = "Tauri-Backend"
)

@mcp.tool()
def say_hello(name: str) -> str:
    # Log thủ công để kiểm tra tham số đầu vào
    logging.debug(f"==> TOOL CALL: say_hello được gọi với name='{name}'")
    result = f"Chào {name}! Chúc bạn một ngày tốt lành."
    logging.debug(f"==> TOOL RESPONSE: {result}")
    return result

if __name__ == "__main__":
    logging.info("MCP Server đang khởi động...")
    if __name__ == "__main__":
        try:
            mcp.run(show_banner=False)
        except EOFError:
            sys.exit(0)