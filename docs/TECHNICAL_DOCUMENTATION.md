# Technical Documentation - Ignite Attendance Management System

## Architecture Overview

### System Architecture
The Ignite Attendance Management System follows a modern three-tier architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - React 18      │    │ - Express.js    │    │ - PostgreSQL 14+│
│ - TypeScript    │    │ - Prisma ORM    │    │ - Row Level     │
│ - Tailwind CSS  │    │ - Socket.io     │    │   Security      │
│ - Vite          │    │ - JWT Auth      │    │ - ACID          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **React Router**: Client-side routing
- **Recharts**: Data visualization library
- **Socket.io Client**: Real-time communication

#### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Prisma**: Next-generation ORM
- **PostgreSQL**: Relational database
- **JWT**: JSON Web Token authentication
- **Socket.io**: Real-time bidirectional communication
- **Winston**: Logging library
- **Multer**: File upload handling
- **Helmet**: Security middleware

#### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Prisma Studio**: Database GUI
- **PM2**: Process management

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │   Student   │    │   Brigade   │
│─────────────│    │─────────────│    │─────────────│
│ id (PK)     │◄──►│ id (PK)     │───►│ id (PK)     │
│ email       │    │ tempRollNum │    │ name        │
│ password    │    │ firstName   │    │ leaderId(FK)│
│ firstName   │    │ lastName    │    │ isActive    │
│ lastName    │    │ email       │    │ createdAt   │
│ role        │    │ phone       │    │ updatedAt   │
│ isActive    │    │ brigadeId   │    └─────────────┘
│ createdAt   │    │ userId (FK) │
│ updatedAt   │    │ isActive    │
│ lastLogin   │    │ createdAt   │
└─────────────┘    │ updatedAt   │
                   └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Attendance  │
                   │   Record    │
                   │─────────────│
                   │ id (PK)     │
                   │ studentId   │
                   │ eventDayId  │
                   │ session     │
                   │ status      │
                   │ markedAt    │
                   │ markedBy    │
                   └─────────────┘
                          │
                          ▼
┌─────────────┐    ┌─────────────┐
│    Event    │    │  EventDay   │
│─────────────│    │─────────────│
│ id (PK)     │◄───│ id (PK)     │
│ name        │    │ eventId(FK) │
│ description │    │ date        │
│ startDate   │    │ fnEnabled   │
│ endDate     │    │ anEnabled   │
│ isActive    │    │ fnStartTime │
│ createdAt   │    │ fnEndTime   │
│ updatedAt   │    │ anStartTime │
└─────────────┘    │ anEndTime   │
                   │ isActive    │
                   └─────────────┘
```

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    role Role DEFAULT 'STUDENT',
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP
);
```

#### Students Table
```sql
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    tempRollNumber TEXT UNIQUE NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    brigadeId TEXT REFERENCES brigades(id),
    userId TEXT UNIQUE REFERENCES users(id),
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Brigades Table
```sql
CREATE TABLE brigades (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    leaderId TEXT REFERENCES users(id),
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Events Table
```sql
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Event Days Table
```sql
CREATE TABLE event_days (
    id TEXT PRIMARY KEY,
    eventId TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    fnEnabled BOOLEAN DEFAULT true,
    anEnabled BOOLEAN DEFAULT true,
    fnStartTime TEXT DEFAULT '09:00',
    fnEndTime TEXT DEFAULT '09:30',
    anStartTime TEXT DEFAULT '14:00',
    anEndTime TEXT DEFAULT '14:30',
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Attendance Records Table
```sql
CREATE TABLE attendance_records (
    id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    eventDayId TEXT NOT NULL REFERENCES event_days(id) ON DELETE CASCADE,
    session Session NOT NULL,
    status AttendanceStatus DEFAULT 'PRESENT',
    markedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    markedBy TEXT REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(studentId, eventDayId, session)
);
```

### Enums

```sql
CREATE TYPE Role AS ENUM ('ADMIN', 'BRIGADE_LEAD', 'STUDENT');
CREATE TYPE Session AS ENUM ('FN', 'AN');
CREATE TYPE AttendanceStatus AS ENUM ('PRESENT', 'ABSENT', 'LATE');
CREATE TYPE NotificationType AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');
```

## API Architecture

### RESTful Design Principles

The API follows REST conventions with consistent patterns:

- **Resource-based URLs**: `/api/students`, `/api/brigades`
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes**: Proper HTTP status codes for different scenarios
- **JSON Format**: All requests and responses use JSON
- **Pagination**: Consistent pagination for list endpoints

### Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ POST /auth/login  │                   │
       ├──────────────────►│                   │
       │                   │ Verify password   │
       │                   ├──────────────────►│
       │                   │                   │
       │                   │ User data         │
       │                   │◄──────────────────┤
       │                   │                   │
       │ JWT Token + User  │                   │
       │◄──────────────────┤                   │
       │                   │                   │
       │ Subsequent API    │                   │
       │ calls with token  │                   │
       ├──────────────────►│                   │
       │                   │ Verify JWT        │
       │                   │                   │
       │ Protected data    │                   │
       │◄──────────────────┤                   │
```

### Middleware Stack

```javascript
app.use(helmet());                    // Security headers
app.use(cors());                      // Cross-origin requests
app.use(rateLimit());                 // Rate limiting
app.use(express.json());              // JSON parsing
app.use(authenticateToken);           // JWT verification
app.use(requireRole(['ADMIN']));      // Role-based access
app.use(errorHandler);                // Error handling
```

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── modals/                # Modal components
│   ├── Layout.tsx             # Main layout wrapper
│   ├── Header.tsx             # Application header
│   └── Sidebar.tsx            # Navigation sidebar
├── pages/
│   ├── admin/                 # Admin-specific pages
│   ├── brigade-lead/          # Brigade lead pages
│   ├── student/               # Student pages
│   └── LoginPage.tsx          # Authentication page
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── api/                       # API client functions
├── types/                     # TypeScript type definitions
├── lib/                       # Utility functions
└── hooks/                     # Custom React hooks
```

### State Management

The application uses React Context for global state management:

```typescript
// Authentication Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
```

### Routing Structure

```typescript
// Role-based routing
{user.role === 'ADMIN' && (
  <>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/students" element={<AdminStudents />} />
    <Route path="/admin/brigades" element={<AdminBrigades />} />
    // ... other admin routes
  </>
)}

{user.role === 'BRIGADE_LEAD' && (
  <>
    <Route path="/brigade/dashboard" element={<BrigadeLeadDashboard />} />
    <Route path="/brigade/students" element={<BrigadeStudents />} />
    // ... other brigade lead routes
  </>
)}
```

## Security Implementation

### Authentication & Authorization

#### JWT Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user_id",
    "role": "ADMIN",
    "iat": 1640995200,
    "exp": 1641081600
  }
}
```

#### Role-Based Access Control (RBAC)

```typescript
// Middleware for role checking
export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

#### Password Security
- **Hashing**: bcrypt with salt rounds of 10
- **Minimum Length**: 6 characters
- **Storage**: Never store plain text passwords

### Data Protection

#### Input Validation
```typescript
// Express Validator example
[
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').isLength({ min: 1 }).trim().escape()
]
```

#### SQL Injection Prevention
- **Prisma ORM**: Automatic query parameterization
- **Type Safety**: TypeScript prevents type-related vulnerabilities

#### XSS Prevention
- **Content Security Policy**: Helmet.js implementation
- **Input Sanitization**: HTML escaping for user inputs
- **Output Encoding**: Proper encoding of dynamic content

### Security Headers

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Real-time Features

### WebSocket Implementation

```typescript
// Server-side Socket.io setup
io.on('connection', (socket) => {
  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
  });
});

// Emit attendance updates
io.to(`user-${student.userId}`).emit('attendance-marked', {
  record: attendanceRecord,
  message: `Attendance marked for ${session} session`
});
```

### Client-side Integration

```typescript
// React component with real-time updates
useEffect(() => {
  const socket = io(API_BASE_URL);
  
  socket.emit('join-room', user.id);
  
  socket.on('attendance-marked', (data) => {
    toast.success(data.message);
    refreshAttendanceData();
  });
  
  return () => socket.disconnect();
}, [user.id]);
```

## Performance Optimization

### Database Optimization

#### Indexing Strategy
```sql
-- Primary indexes (automatic)
CREATE UNIQUE INDEX users_email_idx ON users(email);
CREATE UNIQUE INDEX students_roll_idx ON students(tempRollNumber);

-- Composite indexes for queries
CREATE INDEX attendance_student_event_idx ON attendance_records(studentId, eventDayId);
CREATE INDEX attendance_date_idx ON attendance_records(createdAt);

-- Foreign key indexes
CREATE INDEX students_brigade_idx ON students(brigadeId);
CREATE INDEX brigades_leader_idx ON brigades(leaderId);
```

#### Query Optimization
```typescript
// Efficient pagination with Prisma
const students = await prisma.student.findMany({
  where: whereClause,
  include: {
    brigade: true,
    user: { select: { id: true, email: true, isActive: true } }
  },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});
```

### Frontend Optimization

#### Code Splitting
```typescript
// Lazy loading for route components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const BrigadeLeadDashboard = lazy(() => import('./pages/brigade-lead/BrigadeLeadDashboard'));
```

#### Memoization
```typescript
// React.memo for expensive components
const StudentList = React.memo(({ students, onEdit }) => {
  return (
    <div>
      {students.map(student => (
        <StudentCard key={student.id} student={student} onEdit={onEdit} />
      ))}
    </div>
  );
});
```

### Caching Strategy

#### API Response Caching
```typescript
// Simple in-memory cache for frequently accessed data
const cache = new Map();

const getCachedData = (key: string, fetchFn: () => Promise<any>, ttl = 300000) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

## Error Handling

### Backend Error Handling

```typescript
// Global error handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Duplicate entry',
      message: 'A record with this information already exists'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    error: 'Server error',
    message: message
  });
};
```

### Frontend Error Handling

```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### Backend Testing

```typescript
// Unit test example with Jest
describe('Authentication', () => {
  test('should authenticate valid user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

### Frontend Testing

```typescript
// Component test with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from './LoginPage';

test('renders login form', () => {
  render(<LoginPage />);
  
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});
```

## Monitoring and Logging

### Logging Implementation

```typescript
// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### Health Monitoring

```typescript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

## Deployment Architecture

### Production Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │   Database      │
│   (Nginx)       │    │   (PM2)         │    │   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - SSL/TLS       │    │ - Node.js App   │    │ - Primary DB    │
│ - Rate Limiting │    │ - Process Mgmt  │    │ - Backups       │
│ - Static Files  │    │ - Log Rotation  │    │ - Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Scalability Considerations

#### Horizontal Scaling
- **Stateless Design**: No server-side sessions
- **Database Connection Pooling**: Efficient connection management
- **Load Balancing**: Multiple application instances

#### Vertical Scaling
- **Resource Monitoring**: CPU, memory, disk usage
- **Performance Profiling**: Identify bottlenecks
- **Optimization**: Query optimization, caching

## Development Workflow

### Git Workflow

```
main
├── develop
│   ├── feature/user-management
│   ├── feature/attendance-tracking
│   └── feature/analytics-dashboard
├── hotfix/security-patch
└── release/v1.0.0
```

### CI/CD Pipeline

```yaml
# GitHub Actions example
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deployment script
```

This technical documentation provides a comprehensive overview of the system architecture, implementation details, and best practices used in the Ignite 2026 Attendance Management System.