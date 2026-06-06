"use client";

import { useEffect, useRef } from 'react';
import { GroqGateway } from '@/agent/core/gateway'; 
import { GROQ_DEFAULT_MODEL } from '@/utils/constant';
import { appEmitter } from '@/utils/eventEmitter';

interface QuizPayload {
  attemptId: string;
  timestamp: string;
  score: number;
  totalQuestions: number;
  duration: number;
  accuracy: number;
}

export default function EventEmitterInitializer() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const learningHabitHandler = async (payloadString: string) => {
      try {
        let accuracyCategory = 'chua_tot';
        let speedCategory = 'binh_thuong';
        
        try {
          const data: QuizPayload = typeof payloadString === 'string' 
            ? JSON.parse(payloadString) 
            : (payloadString as unknown as QuizPayload);

          if (data.accuracy >= 80) {
            accuracyCategory = 'rat_tot';
          } else if (data.accuracy >= 50) {
            accuracyCategory = 'trung_binh';
          } else {
            accuracyCategory = 'chua_tot';
          }

          if (data.duration > 0 && (data.duration <= 10 || (data.duration / data.totalQuestions) < 4)) {
            speedCategory = 'sieu_nhanh';
          }
        } catch (e) {
          console.error('[LEARNING_HABIT] Lỗi phân tích payload, chuyển về fallback mặc định', e);
        }

        let userContext = `Hãy viết một lời nhận xét ngẫu hứng dựa trên tình trạng học tập sau đây:\n`;
        
        if (accuracyCategory === 'rat_tot') {
          userContext += `- Kết quả bài quiz: Xuất sắc, chính xác gần như toàn bộ, làm đúng hầu hết các câu hỏi.\n`;
        } else if (accuracyCategory === 'trung_binh') {
          userContext += `- Kết quả bài quiz: Tạm ổn, đúng được một nửa hoặc tầm tầm bậc trung, có tiến bộ nhưng cần cố gắng thêm.\n`;
        } else {
          userContext += `- Kết quả bài quiz: Khá thấp, sai khá nhiều câu, chưa đạt yêu cầu, cần học lại từ đầu để nắm vững kiến thức.\n`;
        }

        if (speedCategory === 'sieu_nhanh') {
          userContext += `- Tốc độ làm bài: Siêu nhanh, chớp nhoáng, nhanh bất thường như thể không cần đọc đề.\n`;
        }

        userContext += `\nYêu cầu đặc biệt: Viết dưới dạng một đoạn văn liền mạch ngắn gọn, KHÔNG kèm theo tiêu đề, KHÔNG liệt kê đầu dòng. TUYỆT ĐỐI KHÔNG ĐƯỢC CHỨA BẤT KỲ CHỮ SỐ NÀO (0-9) HOẶC KÝ HIỆU %.`;

        const systemPrompt = `Bạn là một người bạn thân thiết, vui tính và cực kỳ lầy lội, chuyên đi nhận xét kết quả làm bài của user.
Nhiệm vụ: Viết một lời nhận xét ngắn gọn (dưới 3 câu), mang tính cà khịa nhẹ nhàng nhưng vẫn mang tính chất động viên người học dựa trên ngữ cảnh được cung cấp.

QUY TẮC NGÔN NGỮ BẮT BUỘC (ĐỂ TRÁNH BỊ PHẠT):
* KHÔNG DÙNG bất kỳ kí tự số nào (0-9) hoặc kí hiệu %.
* TUYỆT ĐỐI KHÔNG sử dụng các từ chỉ số đếm cụ thể đi kèm đơn vị phân tách (Ví dụ SAI: "một câu", "hai phút", "bốn mươi phần trăm", "một nửa bài").
* HÃY THAY THẾ bằng các trạng từ phiếm chỉ và tính từ trừu tượng linh hoạt.
  - Thay vì nói điểm số/số lượng, hãy dùng: "kha khá", "đôi chỗ", "gần như trọn vẹn", "kết quả hơi khiêm tốn", "sai sót vài chỗ".
  - Thay vì nói thời gian, hãy dùng: "chớp nhoáng", "tốc độ bàn thờ", "chưa kịp ngấm", "nhanh như chớp".
  
Văn phong tham khảo:
- Thấp + Nhanh: "Lướt qua bài trắc nghiệm nhanh như cách người yêu cũ trở mặt vậy, kiến thức chưa kịp ngấm mà đã chọn xong rồi. Làm lại hiệp nữa cho cái đề biết tay bạn đi nào!"
- Khá: "Cũng ra gì và này nọ đấy, nhưng hình như thần may mắn chỉ gánh bạn được một đoạn thôi. Chịu khó đọc lại bài chút xíu là lần sau ngon ngay!"`;

        const aiResponse = await GroqGateway.request({
          model: GROQ_DEFAULT_MODEL,
          temperature: 0.8,
          max_tokens: 120,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContext },
          ],
        });

        let aiComment = aiResponse.choices?.[0]?.message?.content ?? 'Kiến thức này lạ quá đúng không? Thử lại lần nữa xem sao nhé!';

        aiComment = aiComment.replace(/\bphần trăm\b/gi, 'độ chính xác');
        aiComment = aiComment.replace(/\bmột nửa\b/gi, 'kha khá');

        aiComment = aiComment.replace(/\s+/g, ' ').trim();

        await appEmitter.emit('SHOW_LEARNING_COACH', aiComment);
      } catch (error) {
        console.error('[LEARNING_HABIT]', error);
      }
    };

    appEmitter.on('LEARNING_HABIT', learningHabitHandler);

    return () => {
      appEmitter.off('LEARNING_HABIT', learningHabitHandler);
    };
  }, []);

  return null;
}