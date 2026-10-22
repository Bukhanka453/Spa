-- ============ РОЛИ И ПОЛЬЗОВАТЕЛИ ============
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  default_address TEXT,
  role_id INTEGER NOT NULL DEFAULT 2,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ============ КАТЕГОРИИ И УСЛУГИ ============
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  duration_min INTEGER NOT NULL,
  price REAL NOT NULL,
  image_url TEXT,
  category_id INTEGER,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ============ КОРЗИНА ============
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- ============ ЗАКАЗЫ ============
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  price_at_moment REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

-- ============ ОТЗЫВЫ ============
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- ============ НАЧАЛЬНЫЕ ДАННЫЕ ============
INSERT OR IGNORE INTO roles (id, name) VALUES (1, 'admin'), (2, 'client');

INSERT OR IGNORE INTO categories (id, name) VALUES
  (1, 'Парикмахерские услуги'),
  (2, 'Ногтевой сервис'),
  (3, 'Массаж'),
  (4, 'Консультации');

INSERT OR IGNORE INTO services (id, title, description, duration_min, price, image_url, category_id) VALUES
  (1, 'Стрижка мужская', 'Классическая мужская стрижка', 45, 1500, '/services/haircut-m.jpg', 1),
  (2, 'Стрижка женская', 'Женская стрижка с укладкой', 90, 3000, '/services/haircut-f.jpg', 1),
  (3, 'Окрашивание', 'Окрашивание волос профессиональными красителями', 120, 5500, '/services/coloring.jpg', 1),
  (4, 'Маникюр', 'Аппаратный маникюр с покрытием', 60, 2200, '/services/manicure.jpg', 2),
  (5, 'Массаж спины', 'Классический массаж спины', 50, 2800, '/services/massage.jpg', 3),
  (6, 'Консультация стилиста', 'Подбор образа и рекомендации', 30, 1000, '/services/stylist.jpg', 4);