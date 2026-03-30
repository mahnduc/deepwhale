import json

# 1. Nhận dữ liệu từ Global Variable 'raw_input' (do JS inject vào)
try:
    # Chuyển chuỗi JSON thành Dictionary của Python
    data = json.loads(raw_input)
except NameError:
    # Phòng trường hợp chạy file này độc lập mà không có JS inject
    data = {"name": "Guest", "age": 0}

# 2. Thực hiện Logic xử lý
name = data.get("name", "N/A")
age = data.get("age", 0)

# Chuyển age sang kiểu số để tính toán
try:
    current_age = int(age)
    future_age = current_age + 10
except ValueError:
    future_age = "Không xác định"

# 3. Chuẩn bị kết quả trả về
# Lưu ý: Bạn nên gán kết quả vào một biến (ví dụ: 'response')
# để câu lệnh cuối cùng trong JS exec() có thể trả về giá trị này.
response = {
    "status": "success",
    "user_info": {
        "full_name": name.upper(), # Xử lý string bằng Python
        "current_age": current_age,
        "age_in_2036": future_age
    },
    "engine_note": "Processed by Pyodide VFS"
}

# Câu lệnh cuối cùng này rất quan trọng để JS nhận được giá trị
response