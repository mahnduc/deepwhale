type Task = () => Promise<void> | void;

interface RunResult {
  success: boolean;
  error?: string;
  taskName?: string;
}

class TaskSequencer {
  // Khởi tạo một Promise đã resolve để làm điểm bắt đầu
  private promiseChain: Promise<any> = Promise.resolve();
  private isRunning: boolean = false;

  /**
   * Đăng ký một hàm vào hàng đợi và thực thi tuần tự
   */
  register(task: Task, name?: string): Promise<RunResult> {
    const taskName = name || task.name || "Anonymous Task";

    // Nối tiếp task mới vào chuỗi promise hiện có
    this.promiseChain = this.promiseChain.then(async () => {
      try {
        this.isRunning = true;
        console.log(`--- Đang thực thi: ${taskName} ---`);
        await task();
        return { success: true, taskName };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Lỗi tại ${taskName}: ${errorMsg}`);
        
        // Nếu muốn dừng toàn bộ hàng đợi khi gặp lỗi, ta có thể dùng Promise.reject
        // Ở đây tôi chọn trả về object để bạn tùy nghi xử lý ở phía UI/Log
        return { success: false, taskName, error: errorMsg };
      } finally {
        this.isRunning = false;
      }
    });

    return this.promiseChain;
  }

  get status() {
    return this.isRunning ? "Busy" : "Idle";
  }
}

// --- Cách sử dụng thực tế ---

const sequencer = new TaskSequencer();

// Giả lập các hàm bất đồng bộ với thời gian chạy khác nhau
const mockAsyncTask = (name: string, delay: number, fail = false) => {
  return async () => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (fail) reject(new Error(`Sự cố tại ${name}`));
        else {
          console.log(`Hoàn thành: ${name}`);
          resolve();
        }
      }, delay);
    });
  };
};

// Đăng ký dồn dập nhiều task cùng lúc
console.log("Bắt đầu đăng ký...");

sequencer.register(mockAsyncTask("Task 1 (Cài đặt)", 1000));
sequencer.register(mockAsyncTask("Task 2 (Tải dữ liệu)", 500));
sequencer.register(mockAsyncTask("Task 3 (Kiểm tra)", 800));

// Task này sẽ tự động chờ Task 1, 2, 3 xong mới chạy
sequencer.register(() => console.log("🏁 Tất cả đã xong!"), "Finalize");