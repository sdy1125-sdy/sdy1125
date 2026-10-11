# Sdy — Personal Space

Website bio link tĩnh của Sdy. Thư mục `dist/` là bản được đăng lên GitHub Pages; sửa trực tiếp các tệp trong đó rồi commit và push. Workflow không tạo lại `dist/` từ `src/`, nên các thay đổi trong `dist/` sẽ được giữ nguyên.

## Xem trên máy

Chạy `npm run dev`, rồi mở `http://127.0.0.1:4173`. Lệnh này chỉ phục vụ nội dung trong `dist/`, không ghi đè tệp nào. `npm run lint` kiểm tra cú pháp JavaScript; `npm run build` kiểm tra các tệp cần thiết để đăng trang, không tạo lại chúng.

## Chỉnh sửa và đăng trang

- Giao diện: `dist/index.html`, `dist/style.css`, `dist/app.js`.
- Tên, lời giới thiệu, mạng xã hội, ảnh và nhạc: `dist/config.json`; thay tệp media tương ứng trong `dist/` nếu cần.
- Chạy `npm run lint && npm run build` để kiểm tra.
- Chạy `git add dist && git commit -m "Update site" && git push` để GitHub Pages cập nhật trang ở `https://sdy1125-sdy.github.io/sdy1125/`.

`src/` và `build.mjs` là nguồn cũ, chỉ dùng khi bạn **chủ ý** chạy `npm run build:from-src`. Lệnh đó sẽ ghi đè `dist/`, nên đừng chạy khi đang sửa bản trong `dist/`. Gói `dist/developer-bio-link-termux.tar.gz` là bản sao dành cho Termux và không được đưa lên GitHub Pages.

Trình duyệt có thể chặn nhạc tự phát trước thao tác đầu tiên; nút phát vẫn hiển thị và nhạc sẽ lặp khi phát được.
