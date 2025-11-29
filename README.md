# 🌴 Vacation Tagging System

A full-stack web application for tracking and following vacation destinations. Built with React, Node.js, Express, TypeScript, and MySQL.

## 📋 Features

### User Features
- **Registration & Login** - Secure authentication with JWT tokens
- **Browse Vacations** - View vacation cards sorted by start date
- **Follow/Unfollow** - Track your favorite vacation destinations
- **Filters** - Filter by: Following, Not Started, Active Now
- **Pagination** - 10 vacations per page

### Admin Features
- **Add Vacations** - Create new vacation listings with images
- **Edit Vacations** - Update existing vacation details
- **Delete Vacations** - Remove vacations (with confirmation)
- **Reports Dashboard** - View follower statistics with charts
- **CSV Export** - Download vacation data for analysis

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **TypeScript** - Type-safe JavaScript
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe components
- **React Router v6** - Client-side routing
- **Recharts** - Data visualization
- **Axios** - HTTP client

## 📁 Project Structure

```
vacation-app/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # TypeScript interfaces
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Database connection
│   │   ├── uploads/        # Vacation images
│   │   └── app.ts          # Main application
│   ├── database/
│   │   └── init.sql        # Database schema + sample data
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context (Auth)
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main React app
│   ├── public/
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the initialization script
source backend/database/init.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🐳 Docker Setup (Bonus)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/check-email/:email` | Check email availability |

### Vacations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vacations` | Get all vacations (paginated) |
| GET | `/api/vacations/:id` | Get single vacation |
| POST | `/api/vacations` | Create vacation (admin) |
| PUT | `/api/vacations/:id` | Update vacation (admin) |
| DELETE | `/api/vacations/:id` | Delete vacation (admin) |
| POST | `/api/vacations/:id/follow` | Follow vacation |
| DELETE | `/api/vacations/:id/follow` | Unfollow vacation |
| GET | `/api/vacations/report` | Get followers report (admin) |
| GET | `/api/vacations/csv` | Download CSV report (admin) |

## 👤 Default Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vacations.com | admin123 |
| User | john@example.com | user1234 |

> ⚠️ Change these passwords in production!

## ✅ Validation Rules

### Registration
- All fields required
- Valid email format
- Password: minimum 4 characters
- Email must be unique

### Vacations
- All fields required (image optional for edit)
- Price: 0 - 10,000
- End date >= Start date
- Add: No past dates allowed
- Edit: Past dates allowed (for completed vacations)

## 📊 Database Schema

### Users
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user'
);
```

### Vacations
```sql
CREATE TABLE vacations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  destination VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  imageFileName VARCHAR(255) DEFAULT 'default.jpg'
);
```

### Followers
```sql
CREATE TABLE followers (
  userId INT NOT NULL,
  vacationId INT NOT NULL,
  PRIMARY KEY (userId, vacationId),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (vacationId) REFERENCES vacations(id)
);
```

## 🎨 Screenshots

The application includes:
- Modern, responsive UI design
- Vacation cards with images and status badges
- Interactive charts for admin reports
- Clean forms with validation feedback

## 📝 License

This project is created for educational purposes at John Bryce Training.

---

**Happy Vacationing! 🏖️**
