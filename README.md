# 📚 Hệ Thống Quản Lý Thư Viện Mini (Mini Library Management System)

Đây là bài tập thiết kế và xây dựng một ứng dụng web Quản lý Thư viện Mini, được xây dựng trên nền tảng **Node.js, Express.js** và **SQLite**. Ứng dụng giúp số hóa công việc quản lý sách, độc giả và mượn trả tại một thư viện nhỏ, thay thế cho việc ghi chép sổ sách thủ công truyền thống.

## ✨ Tính năng nổi bật

### 🌐 Trang dành cho Người Dùng (Landing Page)
- Giao diện **Premium Dark Mode** hiện đại, thiết kế theo phong cách Prisma.
- Các chỉ số trực quan (live stats) cập nhật theo thời gian thực.
- Xem danh sách sách nổi bật, tình trạng còn/hết sách trong thư viện.

### 🔑 Trang dành cho Quản Trị Viên (Admin Panel)
- **Bảng Điều Khiển (Dashboard):** Xem tổng quan các chỉ số, cảnh báo phiếu mượn quá hạn, top sách mượn nhiều nhất.
- **Quản lý Sách (CRUD):** Thêm, sửa, xóa, tìm kiếm sách theo tên, tác giả, thể loại, mã ISBN. Quản lý linh hoạt tổng số lượng và số sách hiện có sẵn.
- **Quản lý Độc Giả (CRUD):** Đăng ký tài khoản, xem chi tiết thông tin và lịch sử mượn trả của từng người.
- **Quản lý Mượn/Trả:** 
  - Tạo phiếu mượn sách.
  - Tự động cảnh báo nếu sách đã hết không thể mượn.
  - Tính tiền phạt tự động nếu trả sách trễ hạn (2.000 VNĐ / ngày trễ / quyển).

---

## 🛠 Công nghệ sử dụng

- **Backend:** Node.js, Express.js
- **Database:** SQLite3 (Lưu trữ dữ liệu qua file `.db` gọn nhẹ, không cần cài server database)
- **Frontend / View Engine:** EJS, EJS-Mate
- **CSS:** CSS thuần (Vanilla CSS) với cấu trúc thiết kế hướng Component & biến CSS (CSS Variables)

---

## ⚙️ Hướng dẫn cài đặt và chạy ứng dụng

Vui lòng làm theo các bước dưới đây để có thể chạy ứng dụng trên máy tính của bạn:

### Yêu cầu hệ thống
- Đã cài đặt **[Node.js](https://nodejs.org/en/download/)** (phiên bản 14.x hoặc mới hơn).
- Đã cài đặt **Git**.

### Các bước cài đặt

**Bước 1: Clone dự án về máy**
Mở Terminal / Command Prompt và chạy lệnh sau:
```bash
git clone https://github.com/trananhpham/PHAM_VU_TRAN_ANH_1871040001.git
cd PHAM_VU_TRAN_ANH_1871040001
```

**Bước 2: Cài đặt các thư viện phụ thuộc (Dependencies)**
Trong thư mục dự án, chạy lệnh:
```bash
npm install
```

**Bước 3: Khởi chạy Server**
```bash
node app.js
```

Khi server chạy thành công, Terminal sẽ hiển thị dòng chữ:
```
  📚 ========================================
       HỆ THỐNG QUẢN LÝ THƯ VIỆN MINI
  📚 ========================================
  🌐 Trang chính:  http://localhost:3000
  🔑 Admin Panel:  http://localhost:3000/admin
```

---

## 🚀 Hướng dẫn sử dụng

### Truy cập Trang chủ Người Dùng
Mở trình duyệt web và truy cập: **[http://localhost:3000](http://localhost:3000)**

### Đăng nhập khu vực Quản Trị (Admin)
- Truy cập vào đường link: **[http://localhost:3000/admin](http://localhost:3000/admin)**
- Sử dụng tài khoản mặc định sau để đăng nhập:
  - **Tên đăng nhập:** `admin`
  - **Mật khẩu:** `admin123`

---

## 📂 Cấu trúc thư mục dự án (Project Structure)

```text
/
├── app.js                    # File khởi chạy chính của ứng dụng
├── src/
│   ├── controllers/          # Xử lý logic và cầu nối giữa View và Model
│   ├── database/             # Nơi khởi tạo kết nối SQLite (library.db)
│   ├── middleware/           # Middleware xác thực Admin
│   ├── models/               # Xử lý tương tác DB cho Books, Readers, Borrows
│   ├── routes/               # Chứa các định tuyến (router) của ứng dụng
│   └── views/                # Các file giao diện HTML/EJS
│       ├── admin/            # Giao diện cho Admin Panel
│       ├── layout/           # Template layout chung
│       └── home.ejs          # Giao diện Trang chủ (Landing page)
├── public/
│   ├── css/                  # File CSS (home.css, admin.css)
│   └── assets/               # Hình ảnh, video, icons (nếu có)
├── package.json              # Thông tin dự án và các dependencies
└── README.md                 # Tài liệu hướng dẫn
```

---

## 👩‍💻 Tác giả / Sinh viên thực hiện
**Phạm Vũ Trần Anh** - MSSV: 1871040001
