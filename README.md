# 📚 Mini Library Management System

> Hệ thống Quản lý Thư viện Mini — Ứng dụng web Node.js theo kiến trúc MVC

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-blue?style=flat-square&logo=express)
![SQLite](https://img.shields.io/badge/SQLite-3-lightblue?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/License-ISC-yellow?style=flat-square)

---

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt và chạy](#cài-đặt-và-chạy)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Git Workflow](#git-workflow)
- [API Routes](#api-routes)

---

## 🌟 Giới thiệu

Hệ thống Quản lý Thư viện Mini là một ứng dụng web được xây dựng bằng **Node.js + Express.js**, thay thế việc ghi chép sổ sách thủ công. Hệ thống quản lý toàn bộ vòng đời của sách trong thư viện: từ danh mục sách, thông tin độc giả đến các phiếu mượn/trả sách.

---

## ✨ Tính năng

### 📖 Quản lý Sách
- ✅ Thêm sách mới (tên, tác giả, thể loại, ISBN, số lượng, năm XB, mô tả)
- ✅ Sửa thông tin sách
- ✅ Xóa sách (kiểm tra không đang được mượn)
- ✅ Tìm kiếm theo tên / tác giả / ISBN
- ✅ Lọc theo thể loại
- ✅ Hiển thị số lượng còn lại (🟢 Còn / 🟡 Sắp hết / 🔴 Hết)

### 👥 Quản lý Độc giả
- ✅ Đăng ký độc giả mới (tự động tạo mã thành viên: MEM001, MEM002, ...)
- ✅ Sửa / Xóa thông tin độc giả
- ✅ Tìm kiếm độc giả
- ✅ Xem lịch sử mượn sách chi tiết
- ✅ Thống kê: tổng lượt mượn, đang mượn, tổng tiền phạt

### 📋 Quản lý Mượn/Trả
- ✅ Tạo phiếu mượn sách
- ✅ **Kiểm tra số lượng sách**: Nếu sách = 0, thông báo "Sách đã hết!" và không cho mượn
- ✅ Cập nhật trạng thái trả sách
- ✅ **Tính tiền phạt**: 2,000 VNĐ/ngày/quyển nếu trả trễ
- ✅ Lọc theo trạng thái (đang mượn / đã trả)
- ✅ Xem chi tiết phiếu mượn với thông tin phạt realtime

### 🏠 Dashboard
- ✅ Thống kê tổng quan: sách, độc giả, đang mượn, quá hạn
- ✅ Phiếu mượn gần đây
- ✅ Top 5 sách được mượn nhiều nhất

---

## 🏗️ Kiến trúc hệ thống

Dự án áp dụng **kiến trúc MVC (Model-View-Controller)**:

```
┌─────────────────────────────────────────────────┐
│                    BROWSER                      │
└──────────────────┬──────────────────────────────┘
                   │ HTTP Request
┌──────────────────▼──────────────────────────────┐
│                ROUTES (routes/)                 │
│  bookRoutes | readerRoutes | borrowRoutes        │
└──────────────────┬──────────────────────────────┘
                   │ Dispatch
┌──────────────────▼──────────────────────────────┐
│             CONTROLLER (controllers/)           │  ← C
│  BookController | ReaderController              │
│  BorrowController                               │
└──────────┬───────────────┬────────────────────┘
           │ Data Request   │ Render
┌──────────▼──────────┐ ┌──▼──────────────────────┐
│   MODEL (models/)   │ │    VIEW (views/)         │  ← V, M
│  bookModel.js       │ │  books/, readers/        │
│  readerModel.js     │ │  borrows/, dashboard.ejs │
│  borrowModel.js     │ └─────────────────────────┘
└──────────┬──────────┘
           │ SQL Query
┌──────────▼──────────────────────────────────────┐
│          DATABASE (SQLite - library.db)         │
│  books | readers | borrows                      │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Runtime | Node.js 18+ |
| Web Framework | Express.js 4.x |
| Template Engine | EJS + ejs-mate (layout) |
| Database | SQLite3 (better-sqlite3) |
| Session | express-session |
| Method Override | method-override (PUT/DELETE) |
| CSS | Vanilla CSS (Dark Mode, Glassmorphism) |
| Font | Be Vietnam Pro (Google Fonts) |

---

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- **Node.js** phiên bản 16 trở lên
- **npm** (đi kèm với Node.js)
- **Git**

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd mini-library-management
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Chạy ứng dụng

```bash
npm start
```

Hoặc chạy trực tiếp:

```bash
node app.js
```

### Bước 4: Mở trình duyệt

Truy cập: **http://localhost:3000**

> 💡 **Ghi chú**: Lần đầu chạy, hệ thống sẽ tự động:
> - Tạo file database `library.db`
> - Tạo các bảng cần thiết
> - Thêm dữ liệu mẫu (8 sách + 3 độc giả)

---

## 📖 Hướng dẫn sử dụng

### Quản lý Sách

| Thao tác | URL |
|---|---|
| Danh sách sách | `GET /books` |
| Thêm sách mới | `GET /books/new` → điền form → `POST /books` |
| Chi tiết sách | `GET /books/:id` |
| Sửa sách | `GET /books/:id/edit` → sửa → `PUT /books/:id` |
| Xóa sách | Nhấn nút 🗑️ → `DELETE /books/:id` |

### Quản lý Độc giả

| Thao tác | URL |
|---|---|
| Danh sách độc giả | `GET /readers` |
| Đăng ký độc giả | `GET /readers/new` → `POST /readers` |
| Xem + lịch sử | `GET /readers/:id` |
| Sửa thông tin | `GET /readers/:id/edit` → `PUT /readers/:id` |

### Quản lý Mượn/Trả

| Thao tác | URL |
|---|---|
| Danh sách phiếu | `GET /borrows` |
| Tạo phiếu mượn | `GET /borrows/new` → `POST /borrows` |
| Chi tiết phiếu | `GET /borrows/:id` |
| Trả sách | Nhấn "✅ Trả sách" → `POST /borrows/:id/return` |

### Tính tiền phạt
- Mức phạt: **2,000 VNĐ / ngày / quyển**
- Tính từ ngày quá hạn đến ngày trả thực tế
- Hiển thị phạt realtime trên mỗi phiếu đang mượn

---

## 📁 Cấu trúc thư mục

```
mini-library-management/
│
├── app.js                    # Entry point — khởi tạo Express app
├── package.json
├── .gitignore
├── README.md
│
├── public/                   # Static files
│   ├── css/
│   │   └── style.css         # Design system (dark mode, glassmorphism)
│   └── js/
│       └── main.js           # Client-side JS
│
└── src/                      # Source code (MVC)
    ├── database/
    │   └── db.js             # Khởi tạo SQLite + schema + seed data
    │
    ├── models/               # M - Model (tương tác database)
    │   ├── bookModel.js      # CRUD sách
    │   ├── readerModel.js    # CRUD độc giả + lịch sử
    │   └── borrowModel.js    # Quản lý mượn/trả + tính phạt
    │
    ├── controllers/          # C - Controller (xử lý logic)
    │   ├── bookController.js
    │   ├── readerController.js
    │   └── borrowController.js
    │
    ├── routes/               # Định nghĩa URL routes
    │   ├── bookRoutes.js
    │   ├── readerRoutes.js
    │   └── borrowRoutes.js
    │
    └── views/                # V - View (giao diện EJS)
        ├── layout/
        │   └── main.ejs      # Layout chung (sidebar + topbar)
        ├── dashboard.ejs     # Trang chủ / Dashboard
        ├── error.ejs         # Trang lỗi
        ├── books/
        │   ├── index.ejs     # Danh sách sách
        │   ├── form.ejs      # Form thêm/sửa
        │   └── show.ejs      # Chi tiết sách
        ├── readers/
        │   ├── index.ejs     # Danh sách độc giả
        │   ├── form.ejs      # Form đăng ký/sửa
        │   └── show.ejs      # Chi tiết + lịch sử mượn
        └── borrows/
            ├── index.ejs     # Danh sách phiếu mượn
            ├── form.ejs      # Form tạo phiếu
            └── show.ejs      # Chi tiết phiếu mượn
```

---

## 🌿 Git Workflow

Dự án áp dụng **Feature Branch Workflow**:

```
master (main)
  └── develop
        ├── feature/setup-project     ✅ Cài đặt Express, SQLite, EJS
        ├── feature/manage-books      ✅ CRUD sách + tìm kiếm
        ├── feature/manage-readers    ✅ Quản lý độc giả + đăng ký
        └── feature/borrow-ticket     ✅ Mượn/trả + tính phạt
```

### Quy tắc branch
- ❌ **Không** commit trực tiếp lên `master/main`
- ✅ Tạo feature branch → code → merge vào `develop` → merge vào `main`

### Xem lịch sử commit
```bash
git log --oneline --graph --all
```

---

## 📡 API Routes

| Method | URL | Mô tả |
|---|---|---|
| GET | `/` | Dashboard |
| GET | `/books` | Danh sách sách |
| POST | `/books` | Thêm sách mới |
| GET | `/books/:id` | Chi tiết sách |
| PUT | `/books/:id` | Cập nhật sách |
| DELETE | `/books/:id` | Xóa sách |
| GET | `/readers` | Danh sách độc giả |
| POST | `/readers` | Đăng ký độc giả |
| GET | `/readers/:id` | Chi tiết + lịch sử |
| PUT | `/readers/:id` | Cập nhật độc giả |
| DELETE | `/readers/:id` | Xóa độc giả |
| GET | `/borrows` | Danh sách phiếu mượn |
| POST | `/borrows` | Tạo phiếu mượn |
| GET | `/borrows/:id` | Chi tiết phiếu |
| POST | `/borrows/:id/return` | Trả sách |

---

## 👨‍💻 Tác giả

**Library Dev** — Bài tập: Hệ thống Quản lý Thư viện Mini  
Sử dụng: Node.js + Express + SQLite + EJS + MVC Architecture
