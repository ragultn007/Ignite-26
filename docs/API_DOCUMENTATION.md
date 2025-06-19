# API Documentation

## Overview

The Ignite Attendance Management System provides a comprehensive REST API for managing attendance, users, students, brigades, events, and analytics.

**Base URL:** `http://localhost:5000/api`

## Authentication

All API endpoints (except login) require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Authentication Endpoints

### POST /auth/login
Login with email and password for admin/brigade lead users.

**Request Body:**
```json
{
  "email": "admin@ignite2026.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "admin@ignite2026.com",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "ADMIN",
    "student": null,
    "brigades": []
  }
}
```

### POST /auth/student-login
Login with roll number and password for students.

**Request Body:**
```json
{
  "tempRollNumber": "IG2026001",
  "password": "student123"
}
```

### GET /auth/me
Get current user information.

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "student": {
    "id": "student_id",
    "tempRollNumber": "IG2026001",
    "brigade": {
      "id": "brigade_id",
      "name": "Brigade Alpha"
    }
  }
}
```

## User Management

### GET /users
Get all users (Admin only).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `role` (string): Filter by role (ADMIN, BRIGADE_LEAD, STUDENT)
- `search` (string): Search by name or email

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### POST /users
Create a new user (Admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "BRIGADE_LEAD"
}
```

### PUT /users/:id
Update user information (Admin only).

**Request Body:**
```json
{
  "firstName": "Updated Name",
  "lastName": "Updated Last",
  "role": "ADMIN",
  "isActive": true
}
```

### PUT /users/:id/reset-password
Reset user password (Admin only).

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

### PUT /users/change-password
Change own password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### DELETE /users/:id
Delete a user (Admin only).

## Student Management

### GET /students
Get all students.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search by name or roll number
- `brigadeId` (string): Filter by brigade

**Response:**
```json
{
  "students": [
    {
      "id": "student_id",
      "tempRollNumber": "IG2026001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+91 9876543210",
      "isActive": true,
      "brigade": {
        "id": "brigade_id",
        "name": "Brigade Alpha"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### GET /students/:id
Get student details by ID.

### POST /students
Create a new student.

**Request Body:**
```json
{
  "tempRollNumber": "IG2026002",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+91 9876543211",
  "brigadeId": "brigade_id",
  "createUserAccount": true
}
```

### PUT /students/:id
Update student information.

### DELETE /students/:id
Delete a student (Admin only).

### GET /students/:id/attendance
Get student's attendance summary.

**Response:**
```json
{
  "records": [
    {
      "id": "record_id",
      "session": "FN",
      "status": "PRESENT",
      "markedAt": "2024-01-01T09:15:00.000Z",
      "eventDay": {
        "date": "2024-01-01T00:00:00.000Z",
        "event": {
          "name": "Ignite 2026"
        }
      }
    }
  ],
  "statistics": {
    "totalSessions": 10,
    "presentSessions": 8,
    "absentSessions": 2,
    "lateSessions": 0,
    "attendancePercentage": 80
  }
}
```

## Brigade Management

### GET /brigades
Get all brigades.

**Response:**
```json
[
  {
    "id": "brigade_id",
    "name": "Brigade Alpha",
    "isActive": true,
    "leader": {
      "id": "user_id",
      "firstName": "Brigade",
      "lastName": "Lead 1",
      "email": "lead1@ignite2026.com"
    },
    "students": [
      {
        "id": "student_id",
        "tempRollNumber": "IG2026001",
        "firstName": "John",
        "lastName": "Doe"
      }
    ],
    "_count": {
      "students": 25
    }
  }
]
```

### GET /brigades/:id
Get brigade details by ID.

### POST /brigades
Create a new brigade (Admin only).

**Request Body:**
```json
{
  "name": "Brigade Charlie",
  "leaderId": "user_id"
}
```

### PUT /brigades/:id
Update brigade information (Admin only).

### DELETE /brigades/:id
Delete a brigade (Admin only).

### GET /brigades/:id/stats
Get brigade statistics.

## Event Management

### GET /events
Get all events.

**Response:**
```json
[
  {
    "id": "event_id",
    "name": "Ignite 2026",
    "description": "Annual technical fest",
    "startDate": "2026-03-15T00:00:00.000Z",
    "endDate": "2026-03-17T00:00:00.000Z",
    "isActive": true,
    "eventDays": [
      {
        "id": "day_id",
        "date": "2026-03-15T00:00:00.000Z",
        "fnEnabled": true,
        "anEnabled": true,
        "fnStartTime": "09:00",
        "fnEndTime": "09:30",
        "anStartTime": "14:00",
        "anEndTime": "14:30"
      }
    ]
  }
]
```

### GET /events/current
Get current active event.

**Response:**
```json
{
  "event": {
    "id": "event_id",
    "name": "Ignite 2026",
    "startDate": "2026-03-15T00:00:00.000Z",
    "endDate": "2026-03-17T00:00:00.000Z"
  },
  "currentDay": {
    "id": "day_id",
    "date": "2026-03-15T00:00:00.000Z",
    "fnEnabled": true,
    "anEnabled": true,
    "fnStartTime": "09:00",
    "fnEndTime": "09:30",
    "anStartTime": "14:00",
    "anEndTime": "14:30"
  },
  "activeSession": "FN",
  "sessionStatus": {
    "fn": {
      "enabled": true,
      "time": "09:00 - 09:30",
      "isActive": true
    },
    "an": {
      "enabled": true,
      "time": "14:00 - 14:30",
      "isActive": false
    }
  }
}
```

### POST /events
Create a new event (Admin only).

**Request Body:**
```json
{
  "name": "Ignite 2027",
  "description": "Next year's fest",
  "startDate": "2027-03-15",
  "endDate": "2027-03-17",
  "eventDays": [
    {
      "date": "2027-03-15",
      "fnEnabled": true,
      "anEnabled": true,
      "fnStartTime": "09:00",
      "fnEndTime": "09:30",
      "anStartTime": "14:00",
      "anEndTime": "14:30"
    }
  ]
}
```

### PUT /events/:id
Update event information (Admin only).

### DELETE /events/:id
Delete an event (Admin only).

## Attendance Management

### GET /attendance
Get attendance records.

**Query Parameters:**
- `eventDayId` (string): Filter by event day
- `brigadeId` (string): Filter by brigade
- `session` (string): Filter by session (FN/AN)
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "records": [
    {
      "id": "record_id",
      "session": "FN",
      "status": "PRESENT",
      "markedAt": "2024-01-01T09:15:00.000Z",
      "student": {
        "id": "student_id",
        "tempRollNumber": "IG2026001",
        "firstName": "John",
        "lastName": "Doe",
        "brigade": {
          "name": "Brigade Alpha"
        }
      },
      "eventDay": {
        "date": "2024-01-01T00:00:00.000Z",
        "event": {
          "name": "Ignite 2026"
        }
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

### POST /attendance/mark
Mark attendance for a student.

**Request Body:**
```json
{
  "studentId": "student_id",
  "eventDayId": "day_id",
  "session": "FN",
  "status": "PRESENT"
}
```

### POST /attendance/bulk-mark
Mark attendance for multiple students.

**Request Body:**
```json
{
  "studentIds": ["student_id1", "student_id2"],
  "eventDayId": "day_id",
  "session": "FN",
  "status": "PRESENT"
}
```

### GET /attendance/summary/:eventDayId
Get attendance summary for an event day.

**Query Parameters:**
- `session` (string): Filter by session (optional)

**Response:**
```json
{
  "summary": {
    "totalRecords": 100,
    "presentCount": 85,
    "absentCount": 10,
    "lateCount": 5,
    "presentPercentage": "85.00"
  },
  "brigadeStats": {
    "Brigade Alpha": {
      "total": 25,
      "present": 22,
      "absent": 2,
      "late": 1
    }
  },
  "records": [...]
}
```

## Analytics

### GET /analytics/dashboard
Get dashboard statistics.

**Response:**
```json
{
  "admin": {
    "totalStudents": 100,
    "totalBrigades": 4,
    "totalBrigadeLeads": 4,
    "todayAttendance": 85,
    "overallAttendancePercentage": "87.50",
    "currentEvent": {
      "name": "Ignite 2026",
      "totalDays": 3
    }
  }
}
```

### GET /analytics/attendance-trends
Get attendance trends over time.

**Query Parameters:**
- `days` (number): Number of days (default: 7)
- `brigadeId` (string): Filter by brigade (optional)

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "total": 100,
    "present": 85,
    "absent": 10,
    "late": 5,
    "fnTotal": 50,
    "fnPresent": 45,
    "anTotal": 50,
    "anPresent": 40
  }
]
```

### GET /analytics/brigade-comparison
Get brigade performance comparison (Admin only).

**Response:**
```json
[
  {
    "id": "brigade_id",
    "name": "Brigade Alpha",
    "totalStudents": 25,
    "totalRecords": 250,
    "presentRecords": 220,
    "attendancePercentage": "88.00"
  }
]
```

### GET /analytics/session-analysis
Get session-wise attendance analysis.

**Response:**
```json
{
  "forenoon": {
    "total": 500,
    "present": 450,
    "absent": 40,
    "late": 10,
    "percentage": "90.00"
  },
  "afternoon": {
    "total": 500,
    "present": 420,
    "absent": 60,
    "late": 20,
    "percentage": "84.00"
  }
}
```

## Notifications

### GET /notifications
Get user notifications.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `unreadOnly` (boolean): Show only unread notifications

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification_id",
      "isRead": false,
      "readAt": null,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "notification": {
        "id": "notif_id",
        "title": "Welcome to Ignite 2026",
        "message": "Welcome to the attendance system",
        "type": "INFO",
        "isGlobal": true,
        "targetRole": null
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "itemsPerPage": 10
  }
}
```

### GET /notifications/unread-count
Get unread notification count.

**Response:**
```json
{
  "count": 5
}
```

### PUT /notifications/:id/read
Mark notification as read.

### PUT /notifications/mark-all-read
Mark all notifications as read.

### POST /notifications
Create a notification (Admin only).

**Request Body:**
```json
{
  "title": "System Maintenance",
  "message": "System will be down for maintenance",
  "type": "WARNING",
  "targetRole": "BRIGADE_LEAD",
  "isGlobal": false,
  "expiresAt": "2024-01-02T00:00:00.000Z"
}
```

### DELETE /notifications/:id
Delete a notification (Admin only).

## File Upload

### POST /uploads/students
Upload students from Excel/CSV file.

**Request:** Multipart form data
- `file`: Excel/CSV file
- `brigadeId`: Brigade ID (optional)
- `createUserAccounts`: Boolean (optional)

**Response:**
```json
{
  "message": "Successfully imported 25 students",
  "imported": 25,
  "errors": [],
  "students": [...]
}
```

### GET /uploads/template/students
Download student upload template.

**Response:** Excel file download

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 10,000 requests per 15-minute window per IP address

## WebSocket Events

The system uses Socket.io for real-time features:

### Events
- `attendance-marked` - When attendance is marked
- `new-notification` - When a new notification is created

### Connection
```javascript
const socket = io('http://localhost:5000');
socket.emit('join-room', userId);
```