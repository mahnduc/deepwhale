export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <html>
      <body>
        <h1>404 - Không tìm thấy trang</h1>
        <p>Trang bạn yêu cầu không tồn tại.</p>
        <a href="/">Quay lại trang chủ</a>
      </body>
    </html>
  );
}