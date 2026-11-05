# Sổ Nam Tào — Gọi tên trả bài

Chạy bằng Node.js 20.19+ hoặc 22.12+:

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị, nhập tên người hoặc tên nhóm (mỗi dòng một mục), rồi chọn **Vào địa phủ**.

Không yêu cầu tên lớp; danh sách ban đầu trống. Dữ liệu và lịch sử chỉ giữ trong phiên hiện tại; tải lại trang sẽ bắt đầu trống.

- `src/App.jsx`: giao diện React, nhập danh sách, điểm danh và thiết lập.
- `src/components/Stage.jsx`: sân khấu React, điều khiển, kết quả và vòng đời hoạt cảnh.
- `src/game/bookScene.js`: hoạt cảnh mở sổ, lướt tên, khoanh mực đỏ và đóng dấu.
- `src/game/engine.js`: nền phố địa phủ, âm thanh, phân tích tên và bốc thăm.
- `src/styles.css`: giao diện tách từ HTML gốc.

`npm run build` tạo bản triển khai trong `dist/`. `npm run preview` xem bản build.

Thiết kế phiên bản Sổ Nam Tào: Le Van Ngoc.

Cảnh địa phủ vẽ bằng Canvas: Mạnh Bà nấu canh, Hắc Bạch Vô Thường, Ngộ Không, Đầu Trâu–Mặt Ngựa, hồn ma, sông Vong Xuyên và cầu Nại Hà. Sổ chỉ mở khi bắt đầu; 78% thời gian mới khoanh tên, 86% bắt đầu áp giải và kết thúc mới hiện kết quả.

Sách mở bìa từ phải sang trái, lật nhanh tám trang rồi mới tra tên. Mỗi người được gọi nhận một tội danh hài ngẫu nhiên; nội dung trên sổ và bảng kết quả luôn khớp nhau. Cư dân gồm ma tóc dài, ma đói, ma bộ đội, học giả, người già và người chờ nhận bài tập chuyển từ lớp học. Biển Wi-Fi: `passwifi: diangucxinchao`.

Thư mục dự án: `so-nam-tao`. Nền dùng chủ đề lớp học: quầy bút mực, trạm chuyển bài tập và phòng chờ kiểm tra miệng. Nhân vật phụ, hồn ma và người tham gia có câu thoại luân phiên, giới hạn số bong bóng cùng lúc.

Hắc Bạch tung xích giữ hồ sơ. Hồ sơ tạm thoát được bốc ngẫu nhiên theo từng nhịp và có thể bị quét trở lại. Cú kéo cuối có thể giữ nguyên hoặc bật móc sang hồ sơ còn lại. Bảng trả bài tự mở sau khi đóng ấn.
