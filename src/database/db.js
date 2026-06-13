const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../library.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      isbn TEXT UNIQUE,
      quantity INTEGER NOT NULL DEFAULT 1,
      available INTEGER NOT NULL DEFAULT 1,
      published_year INTEGER,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS readers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      member_id TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS borrows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reader_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      borrow_date DATE NOT NULL DEFAULT (date('now')),
      due_date DATE NOT NULL,
      return_date DATE,
      status TEXT NOT NULL DEFAULT 'borrowing',
      fine_amount REAL DEFAULT 0,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reader_id) REFERENCES readers(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );
  `);

  // Seed data nếu bảng books rỗng
  const bookCount = db.prepare('SELECT COUNT(*) as count FROM books').get();
  if (bookCount.count === 0) {
    seedData();
  }
}

function seedData() {
  const insertBook = db.prepare(`
    INSERT INTO books (title, author, category, isbn, quantity, available, published_year, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertReader = db.prepare(`
    INSERT INTO readers (name, email, phone, address, member_id)
    VALUES (?, ?, ?, ?, ?)
  `);

  const books = [
    ['Lập trình Node.js nâng cao', 'Nguyễn Văn An', 'Công nghệ', 'ISBN001', 5, 5, 2022, 'Sách hướng dẫn Node.js từ cơ bản đến nâng cao'],
    ['Cấu trúc dữ liệu và giải thuật', 'Trần Thị Bình', 'Khoa học máy tính', 'ISBN002', 3, 3, 2021, 'Giáo trình CTDL và thuật toán'],
    ['Thiết kế phần mềm hướng đối tượng', 'Lê Văn Cường', 'Lập trình', 'ISBN003', 4, 4, 2023, 'OOP design patterns'],
    ['Cơ sở dữ liệu quan hệ', 'Phạm Thị Dung', 'Cơ sở dữ liệu', 'ISBN004', 6, 6, 2020, 'SQL và quản lý CSDL'],
    ['JavaScript - The Good Parts', 'Douglas Crockford', 'Lập trình', 'ISBN005', 2, 2, 2019, 'Best practices in JavaScript'],
    ['Clean Code', 'Robert C. Martin', 'Phần mềm', 'ISBN006', 3, 3, 2018, 'Viết code sạch và dễ bảo trì'],
    ['Nhà giả kim', 'Paulo Coelho', 'Văn học', 'ISBN007', 8, 8, 2015, 'Tiểu thuyết nổi tiếng thế giới'],
    ['Đắc nhân tâm', 'Dale Carnegie', 'Kỹ năng sống', 'ISBN008', 10, 10, 2016, 'Nghệ thuật thu phục lòng người'],
  ];

  const readers = [
    ['Nguyễn Minh Tuấn', 'tuan@email.com', '0901234567', 'Hà Nội', 'MEM001'],
    ['Trần Thị Lan', 'lan@email.com', '0912345678', 'TP.HCM', 'MEM002'],
    ['Lê Văn Hùng', 'hung@email.com', '0923456789', 'Đà Nẵng', 'MEM003'],
  ];

  const insertBooksMany = db.transaction(() => {
    for (const book of books) insertBook.run(...book);
  });
  const insertReadersMany = db.transaction(() => {
    for (const reader of readers) insertReader.run(...reader);
  });

  insertBooksMany();
  insertReadersMany();
}

module.exports = { getDb };
