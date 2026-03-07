## **Chiến lược quản lý Log (Log Management Strategy)**
#### **Cấu trúc file Log (File Rotation)**
- RotatingFileHandler: Tự động cắt file khi đạt dung lượng (vd: 30MB).
- TimedRotatingFileHandler: Tự động cắt file theo thời gian (vd: mỗi ngày một file mới).
- Retention: Chỉ giữ lại tối đa 30 file cũ nhất để tiết kiệm không gian.

#### **Định dạng nội dung (Log Formatting)**
- Sử dụng định dạng lưu trữ JSON để xây dựng logs engine với `grafana` + `loki`

#### **Tổ chức thư mục Logs**

- `app.log`: Chứa log chung (INFO và WARNING).

- `error.log`: Chỉ chứa log ERROR và CRITICAL.
---
## **Luồng xử lý Log tập chung (Centralized Logging Pipeline)**
Stack : `grafana` `loki`  

*Tải xuống bộ công cụ triển khai Logging System tối ưu trên nền tảng **Docker** tại đây:*

<a href="downloads/logging-system.zip" download
   style="
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #1CB0F6;
    color: #FFFFFF !important;
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 0 #1899D6;
    box-sizing: border-box;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.5px;
    line-height: 1;
    padding: 12px 24px;
    text-align: center;
    text-decoration: none !important;
    text-transform: uppercase;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    -webkit-font-smoothing: antialiased;
    vertical-align: middle;
    white-space: nowrap;
    margin: 10px 0;
   ">
  DOWNLOAD ZIP
</a>

>**Lưu ý:** Gói cài đặt bao gồm `docker-compose.yml` và các file cấu hình mẫu.
---
#### **Quy trình triển khai hệ thống Logging với Docker**  

**Bước 1: Giải nén gói cài đặt**
1. Tìm file logging-system.zip.
2. Giải nén (Extract) vào thư mục làm việc.
3. Kiểm tra cấu trúc thư mục đảm bảo có ít nhất các file sau:
- `docker-compose.yaml`: File điều phối các container.
- `promtail-config.yaml`: Cấu hình thu thập log.

**Bước 2: Kiểm tra đường dẫn Logs (Quan trọng)**
Trong file docker-compose.yml, ở phần promtail, bạn cần đảm bảo đường dẫn vật lý trỏ đúng vào nơi máy tính bạn đang lưu log.
- Mở file bằng Notepad hoặc VS Code.
- Kiểm tra dòng: - "C:/Users/`username`/AppData/Local/`app-name`/logs:/var/log/mcp".
>Lưu ý: Hãy cập nhật phần C:/Users/... cho đúng với thư mục thực tế trên máy tính.

**Bước 3: Khởi chạy các dịch vụ**
1. Mở Terminal (PowerShell hoặc Command Prompt) tại thư mục đã giải nén.
2. Nhập lệnh sau để tải ảnh và khởi chạy hệ thống:
```docker
docker-compose up -d
```
>`d` *(detached mode)*: Chạy ngầm để bạn có thể đóng Terminal mà hệ thống vẫn hoạt động.
3. Kiểm tra trạng thái các container:
```docker
docker ps
```
>*Đảm bảo cả 3 dịch vụ: loki, promtail, và grafana đều đang ở trạng thái Up.*

---

#### **Trực quan hóa và phân tích Log**
**Bước 1: Cấu hình Grafana(Lần đầu tiên)**
1. Truy cập Grafana tại: http://localhost:3000 (Tài khoản: admin / Mật khẩu: admin).

2. Tại thanh menu bên trái, chọn Connections (biểu tượng bánh răng hoặc ô vuông) > Data Sources.
- Nhấn Add data source và chọn Loki.
- Cấu hình phần HTTP: http://loki:3100

3. Cuộn xuống dưới cùng và nhấn Save & Test.

**Bước 2: Truy vấn Logs (Explore)**
1. Chọn biểu tượng Explore ở menu bên trái.

2. Chọn Data Source là Loki.

3. Trong ô truy vấn (Label browser), nhập:

        {job="mcp_server"} | json
4. Nhấn **Run query**.

**Bước 3: Tạo Dashboard**
1. Chọn Dashboards > New Dashboard > Add visualization.

2. Chọn nguồn dữ liệu Loki.

3. Cấu hình Panel:
- Query: **{job="mcp_server"} | json**
- Title: **MCP Server Live Logs**

4. Ở cột bên phải, phần Visualization, hãy chọn Logs.

5. Nhấn Save ở góc trên bên phải.

---

## **Hướng dẫn sử dụng Log**

#### **Giới thiệu**
Hệ thống logging của dự án được cấu hình tập trung trong: `engine/logs/config.py`  

Logging được thiết kế theo các mục tiêu:
- Ghi log dạng JSON structured để dễ phân tích
- Tương thích với Grafana Loki
- Phân tách application log và error log
- Hỗ trợ log rotation để tránh file quá lớn

Tất cả log sẽ được lưu tại: `%LOCALAPPDATA%/<APP_NAME>/logs/`  
Ví dụ: `C:\Users\<user>\AppData\Local\MCPServer\logs\`  
Các file log bao gồm:
- **app.json**
- **error.json**

#### Khởi tạo Logging
Logging được khởi tạo bằng hàm:
```python
setup_global_logging(app_name="YourAppName")
```
*ví dụ:*
```python
# main.py
from engine.logs.config import setup_global_logging

setup_global_logging("MCPServer")
```

>Chỉ cần gọi một lần duy nhất khi ứng dụng khởi động. Sau khi khởi tạo tất cả module trong project đều có thể sử dụng logging.

#### **Sử dụng Logger trong Module**

Trong mỗi module, tạo logger bằng:
```python
import logging

logger = logging.getLogger(__name__)
```
*ví dụ:*
```python
import logging

logger = logging.getLogger(__name__)

def start_service():
    logger.info("Service started")
```
**`__name__`**: giúp xác định module tạo log.

#### **Các cấp độ Log**
|**Level** | **Mục đích**                   |
| -------- | ---------------------------------- |
| `DEBUG`    | Thông tin debug                    |
| `INFO`     | Hoạt động bình thường của hệ thống |
| `WARNING`  | Cảnh báo                           |
| `ERROR`    | Lỗi xử lý                          |
| `CRITICAL` | Lỗi nghiêm trọng                   |

*ví dụ:*
```python
logger.debug("Debug message")
logger.info("Service started")
logger.warning("Low memory warning")
logger.error("Database connection failed")
logger.critical("System crash")
```

#### **Logging với Metadata**

Hệ thống hỗ trợ structured logging bằng tham số `extra`.

```python
logger.info(
    "User login",
    extra={
        # extra info
    }
)
```

#### **Logging Exception**
Trong hệ thống logging của dự án, hai phương thức thường được dùng để ghi log khi xảy ra lỗi:
- `logger.error()`
- `logger.exception()`

**`logger.error()`**  
*dùng để ghi lại một lỗi xảy ra trong hệ thống, nhưng không tự động ghi stack trace của exception*

**`logger.error()` với stack trace**
```python
import logging

logger = logging.getLogger(__name__)

try:
    value = int("abc")
except Exception:
    logger.exception("Invalid number", exc_info=True)
```

**`logger.exception()`**
*được dùng để ghi log khi xảy ra exception trong khối try/except*