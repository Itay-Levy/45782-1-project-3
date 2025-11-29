-- Create database
CREATE DATABASE IF NOT EXISTS vacations_db;
USE vacations_db;

-- Drop tables if exist (for clean setup)
DROP TABLE IF EXISTS followers;
DROP TABLE IF EXISTS vacations;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vacations table
CREATE TABLE vacations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  destination VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0 AND price <= 10000),
  imageFileName VARCHAR(255) DEFAULT 'default.jpg',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create followers table (junction table)
CREATE TABLE followers (
  userId INT NOT NULL,
  vacationId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userId, vacationId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vacationId) REFERENCES vacations(id) ON DELETE CASCADE
);

-- Insert admin user (password: admin123)
INSERT INTO users (firstName, lastName, email, password, role) VALUES
('Admin', 'User', 'admin@vacations.com', '$2b$10$rIC/b0mSj.NB7rl2XTBXBeYnMKbL7oXeP2t8qLQp7EfDAaWzwMZy6', 'admin');

-- Insert sample users (password: user1234)
INSERT INTO users (firstName, lastName, email, password, role) VALUES
('John', 'Doe', 'john@example.com', '$2b$10$IXFQ.WzYWiOV0wJHDLYrp.W3UrFjZl7Wn4sbvhPyGp7GmWzlLdLnK', 'user'),
('Jane', 'Smith', 'jane@example.com', '$2b$10$IXFQ.WzYWiOV0wJHDLYrp.W3UrFjZl7Wn4sbvhPyGp7GmWzlLdLnK', 'user');
-- Insert 12+ sample vacations with real data
INSERT INTO vacations (destination, description, startDate, endDate, price, imageFileName) VALUES
('Paris, France', 'Experience the magic of Paris! Visit the Eiffel Tower, explore the Louvre Museum, and enjoy romantic walks along the Seine River. Indulge in French cuisine and world-class wine.', '2025-03-15', '2025-03-22', 2500.00, 'paris.jpg'),

('Tokyo, Japan', 'Discover the perfect blend of ancient tradition and cutting-edge technology. Visit historic temples, explore vibrant neighborhoods like Shibuya and Harajuku, and savor authentic Japanese cuisine.', '2025-04-01', '2025-04-10', 3500.00, 'tokyo.jpg'),

('Santorini, Greece', 'Relax on the stunning Greek island of Santorini. Enjoy breathtaking sunsets, white-washed buildings with blue domes, delicious Mediterranean food, and crystal-clear waters.', '2025-05-10', '2025-05-17', 2800.00, 'santorini.jpg'),

('New York City, USA', 'The city that never sleeps awaits! See Broadway shows, visit Central Park, explore world-class museums, and experience the energy of Times Square and Manhattan.', '2025-02-20', '2025-02-27', 3200.00, 'newyork.jpg'),

('Bali, Indonesia', 'Find peace and adventure in Bali. Visit ancient temples, relax on pristine beaches, enjoy spa treatments, and explore lush rice terraces and tropical forests.', '2025-06-05', '2025-06-14', 2200.00, 'bali.jpg'),

('Rome, Italy', 'Step back in time in the Eternal City. Explore the Colosseum, Vatican City, and ancient ruins. Enjoy authentic Italian pasta, gelato, and espresso.', '2025-04-15', '2025-04-23', 2600.00, 'rome.jpg'),

('Maldives', 'Experience paradise on Earth. Stay in overwater bungalows, snorkel in crystal-clear waters, relax on white sandy beaches, and enjoy world-class luxury.', '2025-07-01', '2025-07-08', 5500.00, 'maldives.jpg'),

('Barcelona, Spain', 'Explore Gaudí architecture, walk down La Rambla, enjoy tapas and sangria, and relax on beautiful Mediterranean beaches in this vibrant Spanish city.', '2025-05-20', '2025-05-28', 2100.00, 'barcelona.jpg'),

('Dubai, UAE', 'Experience luxury and innovation in Dubai. Visit the Burj Khalifa, shop at world-famous malls, enjoy desert safaris, and experience futuristic attractions.', '2025-03-01', '2025-03-08', 3800.00, 'dubai.jpg'),

('Sydney, Australia', 'Discover the wonders of Sydney. See the iconic Opera House and Harbour Bridge, relax at Bondi Beach, and explore nearby Blue Mountains.', '2025-08-10', '2025-08-20', 4200.00, 'sydney.jpg'),

('Amsterdam, Netherlands', 'Cruise the canals, visit world-renowned museums like the Van Gogh Museum and Anne Frank House, and explore the charming streets of this beautiful Dutch city.', '2025-04-05', '2025-04-12', 1900.00, 'amsterdam.jpg'),

('Machu Picchu, Peru', 'Trek to the ancient Incan citadel of Machu Picchu. Experience breathtaking mountain views, rich history, and the magic of this UNESCO World Heritage site.', '2025-09-01', '2025-09-10', 3100.00, 'machupicchu.jpg'),

('Reykjavik, Iceland', 'Chase the Northern Lights, soak in geothermal hot springs, explore glaciers and waterfalls, and experience the unique beauty of Iceland.', '2025-01-15', '2025-01-22', 2900.00, 'iceland.jpg'),

('Cancun, Mexico', 'Relax on pristine Caribbean beaches, explore Mayan ruins, swim in cenotes, and enjoy vibrant nightlife in this popular Mexican resort destination.', '2025-06-20', '2025-06-28', 1800.00, 'cancun.jpg');

-- Insert some sample followers
INSERT INTO followers (userId, vacationId) VALUES
(2, 1), (2, 3), (2, 5), (2, 7),
(3, 1), (3, 2), (3, 4), (3, 6), (3, 8);

-- Create indexes for better performance
CREATE INDEX idx_vacations_startDate ON vacations(startDate);
CREATE INDEX idx_followers_userId ON followers(userId);
CREATE INDEX idx_followers_vacationId ON followers(vacationId);
