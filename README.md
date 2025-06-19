# Ignite - Attendance Management System

A comprehensive attendance management system built for Kumaraguru Institutions' Ignite 2026 freshers induction program.

## 🌟 Features

- **Multi-role Authentication**: Admin, Brigade Lead, and Student roles with secure JWT authentication
- **Real-time Attendance Tracking**: Mark attendance for FN/AN sessions with time-based validation
- **Brigade Management**: Organize students into brigades with dedicated leadership
- **Event Management**: Create and manage multi-day events with flexible session configurations
- **Analytics Dashboard**: Comprehensive attendance reports and analytics with visual charts
- **Bulk Operations**: Upload students via Excel/CSV files with validation and error handling
- **Student Summary**: Individual student lookup with complete attendance history
- **Notifications**: Real-time notifications system with role-based targeting
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: WebSocket integration for live attendance updates

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** database with Prisma ORM
- **JWT** authentication with bcrypt password hashing
- **Socket.io** for real-time features
- **Winston** for comprehensive logging
- **Multer** for file upload handling
- **Express Validator** for input validation

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern styling
- **Radix UI** for accessible components
- **React Router** for client-side navigation
- **Recharts** for data visualization
- **Sonner** for toast notifications
- **Vite** for fast development and building

## 📋 Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+
- **npm** or **yarn**

##   Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ignite-2026
```

### 2. Install Dependencies
```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Setup

#### Backend Environment
Copy the example environment file and update with your settings:
```bash
cp backend/.env.ex backend/.env
```

Update `backend/.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ignite2026_db?schema=public"
JWT_SECRET="your-super-secure-jwt-secret-key"
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment
```bash
cp frontend/.env.example frontend/.env
```

Update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Start Development Servers

#### Option 1: Start Both Servers Concurrently
```bash
npm run dev
```

#### Option 2: Start Servers Separately
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔑 Default Credentials

### Admin Access
- **Email**: admin@ignite2026.com
- **Password**: admin123

### Brigade Lead Access
- **Email**: lead1@ignite2026.com
- **Password**: lead123

### Student Access
- **Roll Number**: IG2026001
- **Password**: student123

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete REST API reference
- **[User Manual](docs/USER_MANUAL.md)** - Detailed user guide for all roles
- **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)** - System architecture and implementation details
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Complete database design documentation
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Features Overview](docs/FEATURES_OVERVIEW.md)** - Comprehensive feature documentation

## 🏗️ Project Structure

```
ignite-2026/
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── api/            # API client functions
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── docs/                   # Documentation
└── package.json           # Root package.json for scripts
```

## 🔧 Available Scripts

### Root Level Scripts
```bash
npm run dev              # Start both backend and frontend
npm run build           # Build both applications
npm run start           # Start production backend
npm run install:all     # Install all dependencies
npm run db:setup        # Setup database with migrations and seed
```

### Backend Scripts
```bash
npm run dev             # Start development server with nodemon
npm run start           # Start production server
npm run build           # Build application
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes to database
npm run db:seed         # Seed database with sample data
```

### Frontend Scripts
```bash
npm run dev             # Start Vite development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

## 🎯 Key Features Walkthrough

### For Administrators
1. **Dashboard**: Overview of system statistics and current event status
2. **Student Management**: Add, edit, and manage student records with bulk upload
3. **Student Summary**: Search individual students by roll number for detailed reports
4. **Brigade Management**: Create brigades and assign leaders
5. **User Management**: Manage user accounts and permissions
6. **Event Management**: Create events with configurable session times
7. **Analytics**: Comprehensive attendance analytics and brigade comparisons
8. **Notifications**: Send targeted notifications to specific user groups

### For Brigade Leads
1. **Brigade Dashboard**: Overview of assigned brigades and performance metrics
2. **Student Management**: Manage students within assigned brigades
3. **Attendance Marking**: Real-time attendance marking with bulk operations
4. **Analytics**: Brigade-specific attendance trends and session analysis
5. **Notifications**: Receive leadership-specific announcements

### For Students
1. **Personal Dashboard**: Individual attendance statistics and performance
2. **Profile Management**: Update personal information and change password
3. **Attendance History**: Complete attendance record with visual analytics
4. **Notifications**: Receive important announcements and updates

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt with salt
- **Role-Based Access Control** (RBAC) for all endpoints
- **Input Validation** and sanitization
- **SQL Injection Prevention** through Prisma ORM
- **XSS Protection** with Content Security Policy
- **Rate Limiting** to prevent API abuse
- **HTTPS Enforcement** in production
- **Comprehensive Logging** for security monitoring

## 📊 Database Design

The system uses PostgreSQL with a well-designed schema supporting:
- **User Management** with role-based access
- **Student Organization** through brigades
- **Event Management** with flexible session configurations
- **Attendance Tracking** with comprehensive audit trails
- **Notification System** with targeted delivery

Key entities include Users, Students, Brigades, Events, EventDays, AttendanceRecords, and Notifications with proper relationships and constraints.

## 🚀 Deployment

### Production Deployment

1. **Server Setup**: Ubuntu 20.04+ with Node.js 18+, PostgreSQL 14+, and Nginx
2. **Database Configuration**: Production PostgreSQL setup with proper security
3. **Application Deployment**: PM2 for process management
4. **Reverse Proxy**: Nginx configuration with SSL/TLS
5. **Security**: Firewall, SSL certificates, and security headers
6. **Monitoring**: Logging, health checks, and performance monitoring

Detailed deployment instructions are available in the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ignite2026_db"
JWT_SECRET="your-super-secure-jwt-secret"
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://yourdomain.com/api
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                # Run component tests
npm run test:e2e        # Run end-to-end tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow the existing code style and conventions
- Ensure all tests pass before submitting PRs

## 📝 API Reference

The system provides a comprehensive REST API with the following main endpoints:

- **Authentication**: `/api/auth/*` - Login, logout, and user verification
- **Users**: `/api/users/*` - User management operations
- **Students**: `/api/students/*` - Student CRUD operations
- **Brigades**: `/api/brigades/*` - Brigade management
- **Events**: `/api/events/*` - Event and event day management
- **Attendance**: `/api/attendance/*` - Attendance tracking and reporting
- **Analytics**: `/api/analytics/*` - Statistical data and reports
- **Notifications**: `/api/notifications/*` - Notification management
- **Uploads**: `/api/uploads/*` - File upload operations

Complete API documentation with request/response examples is available in [API Documentation](docs/API_DOCUMENTATION.md).

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify database exists
psql -h localhost -U your_user -l
```

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

#### Permission Issues
```bash
# Fix file permissions
chmod +x scripts/*.sh
chown -R $USER:$USER node_modules
```

### Getting Help

If you encounter issues:
1. Check the [User Manual](docs/USER_MANUAL.md) for common solutions
2. Review the [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md) for implementation details
3. Check the GitHub Issues for similar problems
4. Create a new issue with detailed information about the problem

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Documentation**: Check the comprehensive docs in the `docs/` directory
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Email**: [Contact information for project maintainers]

---

Built with ❤️ for Kumaraguru by Ragul Adhithya.