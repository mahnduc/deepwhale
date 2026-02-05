# [StudyMind Agent](https://studymindagent.pages.dev/#/)

## Luồng hoạt động
Người dùng thực hiện giao nhiệm vụ cho agent thông qua hình thức chat, agent sử dụng bộ tri thức được cung cấp bởi người dùng để thực hiện nhiệm vụ được giao.

## Tính năng
Agent sẽ có những tính năng sau:
- **Mô tả**: Hệ thống agent tự nâng cấp theo yêu cầu của người dùng

---

# Tổng quan Agent (Agent Architecture)

## Các thành phần cơ bản trong kiến trúc agent bao gồm

### Góc nhìn hệ thống
- **Sensor (Cảm biến)**: Thu thập dữ liệu từ môi trường
- **Perception (Nhận thức)**: Phân tích và chuyển đổi dữ liệu cảm biến thành thông tin ý nghĩa
- **Reasoning / Decision-making (Lý luận / Quyết định)**: Đưa ra hành động dựa trên dữ liệu và mục tiêu
- **Action (Hành động)**: Tác động trở lại môi trường dựa vào quyết định đã được đưa ra
- **Feedback loop (Vòng phản hồi)**: Đánh giá kết quả và điều chỉnh hành vi nếu cần thiết

### Góc nhìn kiến trúc
- Bộ não
- Trí nhớ
- Công cụ
- Cơ chế phản hồi

---

## Bảng đối chiếu Hệ thống – Kiến trúc

| Nhóm thành phần | Khía cạnh Hệ thống              | Khía cạnh Kiến trúc |
|----------------|----------------------------------|---------------------|
| Đầu vào        | Sensor, Perception               | Dữ liệu đầu vào     |
| Xử lý          | Reasoning / Decision-making      | Bộ não, Trí nhớ     |
| Đầu ra         | Action                           | Công cụ             |
| Kiểm soát      | Feedback loop                    | Cơ chế phản hồi     |

---

## Thành phần nhận diện (Input & Perception)
*__Nơi "agent" tiếp xúc với thế giới__*

- **Sensor (Cảm biến)**: Các "giác quan" kỹ thuật số.  
  Đối với AI Agent, cảm biến có thể là:
  - Ô nhập văn bản (Chat box)
  - Camera (Computer Vision)
  - API lắng nghe dữ liệu (ví dụ: thị trường chứng khoán)

- **Perception (Nhận thức)**:  
  Sau khi có dữ liệu thô, Agent cần "hiểu".  
  Ví dụ: Từ một tệp âm thanh (*Data*), agent nhận diện được đó là ngôn ngữ tiếng Việt (*Information*).

---

## Thành phần tư duy (The Brain & Reasoning)
*__Bộ xử lý trung tâm do các mô hình ngôn ngữ lớn đảm nhiệm__*

- **Bộ não (The Brain)**:  
  Nơi chứa tri thức nền tảng và khả năng ngôn ngữ.

- **Reasoning / Decision-making (Lý luận)**:  
  Khả năng logic của agent.  
  Agent tự hỏi:  
  > “Với yêu cầu này, mình nên làm bước nào trước?”

  Sử dụng các kỹ thuật như **Chain-of-Thought** để lập kế hoạch.

### Trí nhớ (Memory)
- **Ngắn hạn (Short-term Memory)**:  
  Nhớ nội dung cuộc chat để không lặp lại câu hỏi
- **Dài hạn (Long-term Memory)**:  
  Tra cứu tài liệu cũ hoặc sở thích người dùng để đưa ra quyết định cá nhân hóa hơn

---

## Thành phần thực thi (Action & Tools)
*__Agent sẽ bắt đầu thực hiện công việc sau khi đã suy nghĩ xong__*

- **Công cụ (Tools)**:  
  Là các "cánh tay" của agent:
  - Không tự tính toán phức tạp → dùng Máy tính
  - Không tự gửi mail → dùng Gmail API

- **Action (Hành động)**:  
  Thực hiện lệnh thông qua công cụ, tác động lên môi trường:
  - Gửi tin nhắn
  - Tạo file
  - Mua hàng

---

## Thành phần tối ưu
*__Đảm bảo agent không đi chệch hướng__*

- **Feedback loop (Vòng phản hồi)**:  
  Agent nhận lại kết quả sau hành động  
  Ví dụ: *“Lỗi 404 – Không tìm thấy trang”*

- **Cơ chế phản hồi (Self-Correction)**:  
  Agent tự điều chỉnh thay vì bỏ cuộc:
  > “Link này hỏng rồi, mình sẽ tìm link khác”

  → Khả năng **Self-reflection**

---

# Kiến trúc đơn luồng (Single Thread)

# Trí nhớ của Agent

## Phân loại

### Trí nhớ ngắn hạn (Short-term Memory – STM)
Lưu trữ thông tin tạm thời trong một phiên làm việc:
- Câu hỏi trước đó
- Trạng thái hội thoại

### Trí nhớ dài hạn (Long-term Memory – LTM)
Lưu trữ thông tin xuyên suốt nhiều phiên, có thể truy xuất lại khi cần.

### Episodic Memory
Lưu các sự kiện, trải nghiệm cụ thể của agent.

### Semantic Memory
Lưu tri thức tổng quát, khái niệm và kiến thức nền.
