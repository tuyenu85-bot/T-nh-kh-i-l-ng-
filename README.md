# Bóc tách sắt mỹ thuật — PWA demo

## Chạy thử
- Giải nén thư mục và chạy qua máy chủ HTTPS hoặc localhost (không mở trực tiếp `file://`).
- Ví dụ nhanh: `python -m http.server 8080` rồi mở `http://localhost:8080`.
- Trên hosting HTTPS (Netlify, Cloudflare Pages, GitHub Pages hoặc hosting tĩnh tương đương), tải toàn bộ nội dung thư mục này lên thư mục gốc hoặc một thư mục con. Không đổi đường dẫn tương đối nếu chưa chỉnh `manifest.webmanifest` và `sw.js`.
- Android/Chrome: chọn **Cài đặt ứng dụng** hoặc **Thêm vào màn hình chính**. iPhone/Safari: Chia sẻ → **Thêm vào MH chính**.

## Đã triển khai và kiểm tra
- Tính chiều dài sắt thẳng theo `chiều dài một thanh × số thanh`.
- Tính đường tâm sắt uốn, chiều dài phôi (nếu nhập) và khối lượng; khi chưa có phôi, khối lượng tạm dùng chiều dài đường tâm.
- Tính khối lượng phụ kiện theo số lượng × kg/cái, không cộng phụ kiện vào tổng mét thép thanh.
- Công thức kg/m cho hộp, vuông đặc, tròn đặc, thép la; cho phép sửa kg/m từng dòng.
- Có mã lưu dữ liệu trên thiết bị bằng localStorage; cần xác nhận thao tác lưu thực tế sau khi chạy trên origin HTTPS/localhost.
- Xem ảnh mẫu gốc LBG-01; nạp ảnh hoặc PDF khác. PDF được hiển thị bằng trình xem sẵn có của trình duyệt.
- Nạp và bật/tắt lớp phủ PNG trong suốt trên ảnh raster; điều chỉnh độ mờ.
- Đã tạo PWA manifest, icon và service worker cache app shell; việc cài đặt và chạy offline cần kiểm tra lại trên hosting HTTPS thực tế.

## Chưa có — không được hiểu là đã tự động bóc tách
- Chưa đọc vector PDF, nhận kích thước / chú thích / layer CAD.
- Chưa đọc DWG/DXF.
- Chưa có thuật toán segmentation, skeleton/centerline, phân luồng tại giao điểm hoặc đo đường cong tự động.
- Chưa phân loại hoa/lá/phụ kiện tự động.
- Chưa tự sinh lớp phủ centerline; hiện chỉ hiển thị lớp PNG do người dùng nạp.
- Không có backend, đồng bộ nhiều thiết bị hoặc cơ chế quản lý dự án.

## Kiểm tra chạy thử
- Đã chạy kiểm thử giao diện mobile trong Chromium bằng DOM thực: không phát sinh lỗi JavaScript.
- Dữ liệu mẫu cho kết quả 10,605 m (hiển thị 10,61 m) và 19,822786 kg (hiển thị 19,82 kg) đối với các dòng có kg/m đã biết.
- Thử thêm 2 thanh uốn: đường tâm 1.200 mm/thanh, phôi 1.300 mm/thanh, 1,5386 kg/m → 2,40 m đường tâm và 4,00 kg.
- Thử 3 phụ kiện × 0,25 kg/cái → 0,75 kg; thử đổi quy cách, nạp PDF, nạp / ẩn / hiện PNG phủ và chỉnh opacity 40% đều đạt.
- Đã kiểm tra cú pháp JavaScript, JSON manifest và kích thước icon PWA. Service worker cần được kiểm tra thêm sau khi triển khai lên hosting HTTPS thực tế.

## Dữ liệu mẫu
Ảnh `assets/lbg01.png` là ảnh raster 2382×1684 của bản vẽ LBG-01 đã có trong cuộc trò chuyện; tệp PDF gốc không có trong thư mục làm việc của lượt tạo này, nên app nhúng bản ảnh gốc đã render chứ không nhúng PDF vector. Các dòng tay vịn 2950×1, thanh ngang 2850×2, thanh đứng 760×2, chân 85×3 và thanh nối 60×3 chỉ là dữ liệu nhập mẫu theo thông tin đã trao đổi; vật liệu của chân và thanh nối chưa được xác định nên kg/m để 0. Không dùng số liệu mẫu làm bảng khối lượng chốt thi công nếu chưa kiểm tra lại bản vẽ.
