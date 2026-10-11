# Sdy — Personal Space

Trang bio link một màn hình cho Sdy. Ảnh cá nhân là nền, bốn mạng xã hội ở ngay trên màn hình, và bài Tìm Em có điều khiển phát/lặp lại ở cạnh dưới. Trang có mưa chuyển động nhẹ, ánh sáng và parallax khi dùng chuột; tôn trọng chế độ giảm chuyển động của hệ thống. Bảng lệnh mở bằng nút góc phải hoặc phím /.

Biểu tượng GitHub, Facebook, Discord và Instagram là SVG lưu trong src/icons/ từ dự án Simple Icons (https://github.com/simple-icons/simple-icons, CC0-1.0). Nút có viền và ánh sáng neon riêng khi hover, focus hoặc chạm; không cần tải icon qua CDN.

Trang dùng HTML, CSS và JavaScript thuần. Không cần framework hay thư viện animation để tạo các hiệu ứng này; cách này giữ tải trang nhẹ và dễ chạy trong Termux. Node.js dùng để tạo bản tĩnh từ src/config.json. Package manager là npm.

## Chạy

Cần Node.js 20 trở lên. Trong thư mục dự án, chạy npm run dev rồi mở http://127.0.0.1:4173 trên cùng thiết bị. Nếu cổng đang được dùng, tắt tiến trình cũ trước khi chạy lại. npm run lint kiểm tra mã và npm run build tạo thư mục dist/ để đưa lên dịch vụ hosting tĩnh.

## Thay nội dung

Sửa tên, vai trò, câu chữ, ảnh, nhạc và URL xã hội ở src/config.json. Tệp ảnh hiện là src/portrait.jpg; nhạc là src/background-music.mp3. Nếu đổi tệp, đặt tệp mới trong src/ rồi điền đường dẫn bắt đầu bằng / vào config. Build sẽ chép các tài nguyên được dùng sang dist/.

Trình duyệt có thể chặn nhạc tự phát trước khi người xem tương tác. Nút phát luôn hiển thị, và trang sẽ thử phát lại sau thao tác đầu tiên. Nhạc tự lặp. Các liên kết mở trong tab mới. Website không có video, thư viện ảnh hay khu dự án vì thiết kế này ưu tiên nội dung chính trên một màn hình.

siteUrl trong config dùng cho metadata khi chia sẻ. Sau khi triển khai ở địa chỉ khác, đổi siteUrl và build lại. Ảnh Open Graph ở src/og.png và favicon ở src/favicon.svg.

## Đăng lên GitHub Pages

Kho công khai dành cho trang này là `sdy1125-sdy/sdy1125`. Đặt mã nguồn lên nhánh `main` của kho đó, rồi tại **Settings → Pages → Build and deployment → Source** chọn **GitHub Actions**. Workflow `.github/workflows/pages.yml` sẽ chạy lint/build và xuất thư mục `dist/`. Khi workflow thành công, trang ở `https://sdy1125-sdy.github.io/sdy1125/`. Mỗi lần đẩy bản cập nhật lên `main`, trang sẽ tự xuất bản lại.

Kho cần công khai để mọi người mở được link. File `.gitignore` loại trừ các bản sao lưu, cấu hình hosting cũ và `dist/`; workflow cũng bỏ gói tar dành cho Termux khỏi bản xuất bản. Đổi `siteUrl` trong `src/config.json` nếu dùng địa chỉ khác. Đường dẫn tài nguyên trong HTML/JS tương đối với thư mục trang, nên chạy được cả ở URL có `/ten-kho/`.

Nếu chạy trên Termux, vào đúng thư mục dự án và dùng npm run dev. Máy chủ phát triển mặc định chỉ nghe ở 127.0.0.1; để người khác xem từ Internet, triển khai dist/ lên hosting tĩnh. Không cần XAMPP.

