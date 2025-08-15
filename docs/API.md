# API Dokümantasyonu

Bu dokümant Dernek Yönetim Paneli'nin backend API'sinin detaylı kullanım kılavuzudur.

## 📋 İçindekiler

- [Genel Bilgiler](#genel-bilgiler)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Performance](#performance)

## 🌐 Genel Bilgiler

### Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

### Content Type
Tüm request'ler `application/json` content type kullanır.

### Response Format
```typescript
interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  errors?: string[]
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}
```

## 🔐 Authentication

### JWT Token
API authentication için Supabase JWT token kullanır.

```http
Authorization: Bearer <jwt_token>
```

### Token Alma
```typescript
import { supabase } from './lib/supabase'

const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

## 📚 API Endpoints

### Auth Module

#### POST /api/auth/register
Yeni kullanıcı kaydı

**Request Body:**
```typescript
{
  email: string
  password: string
  fullName: string
  role?: UserRole
}
```

**Response:**
```typescript
{
  data: {
    user: User
    session: Session
  }
  success: boolean
}
```

#### POST /api/auth/login
Kullanıcı girişi

**Request Body:**
```typescript
{
  email: string
  password: string
}
```

#### POST /api/auth/logout
Kullanıcı çıkışı

#### GET /api/auth/profile
Kullanıcı profili getir

**Response:**
```typescript
{
  data: {
    id: string
    email: string
    fullName: string
    role: UserRole
    avatar?: string
    isActive: boolean
    lastLogin?: string
    createdAt: string
  }
}
```

#### PUT /api/auth/profile
Kullanıcı profili güncelle

**Request Body:**
```typescript
{
  fullName?: string
  avatar?: string
  preferences?: UserPreferences
}
```

### Users Module

#### GET /api/users
Kullanıcı listesi

**Query Parameters:**
```typescript
{
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: 'active' | 'inactive'
  sort?: 'name' | 'email' | 'createdAt'
  order?: 'asc' | 'desc'
}
```

**Response:**
```typescript
{
  data: User[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
```

#### GET /api/users/:id
Kullanıcı detayı

#### POST /api/users
Yeni kullanıcı oluştur

**Request Body:**
```typescript
{
  email: string
  fullName: string
  role: UserRole
  isActive?: boolean
}
```

#### PUT /api/users/:id
Kullanıcı güncelle

#### DELETE /api/users/:id
Kullanıcı sil

#### POST /api/users/:id/deactivate
Kullanıcıyı deaktive et

#### POST /api/users/:id/activate
Kullanıcıyı aktive et

### Meetings Module

#### GET /api/meetings
Toplantı listesi

**Query Parameters:**
```typescript
{
  page?: number
  limit?: number
  status?: MeetingStatus
  startDate?: string
  endDate?: string
  organizerId?: string
}
```

#### GET /api/meetings/:id
Toplantı detayı

**Response:**
```typescript
{
  data: {
    id: string
    title: string
    description?: string
    startTime: string
    endTime: string
    location?: string
    organizer: User
    participants: Participant[]
    agenda: AgendaItem[]
    notes: MeetingNote[]
    status: MeetingStatus
    createdAt: string
    updatedAt: string
  }
}
```

#### POST /api/meetings
Yeni toplantı oluştur

**Request Body:**
```typescript
{
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  participants?: string[] // User IDs
  agenda?: AgendaItem[]
}
```

#### PUT /api/meetings/:id
Toplantı güncelle

#### DELETE /api/meetings/:id
Toplantı sil

#### POST /api/meetings/:id/participants
Katılımcı ekle

**Request Body:**
```typescript
{
  userId: string
  role?: 'organizer' | 'participant' | 'observer'
}
```

#### DELETE /api/meetings/:id/participants/:userId
Katılımcı çıkar

#### POST /api/meetings/:id/agenda
Ajanda öğesi ekle

**Request Body:**
```typescript
{
  title: string
  description?: string
  duration?: number
  order: number
}
```

#### PUT /api/meetings/:id/agenda/:agendaId
Ajanda öğesi güncelle

#### POST /api/meetings/:id/notes
Toplantı notu ekle

**Request Body:**
```typescript
{
  content: string
  type?: 'general' | 'action' | 'decision'
}
```

### Tasks Module

#### GET /api/tasks
Görev listesi

**Query Parameters:**
```typescript
{
  page?: number
  limit?: number
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  projectId?: string
  dueDate?: string
}
```

#### GET /api/tasks/:id
Görev detayı

**Response:**
```typescript
{
  data: {
    id: string
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    assignee?: User
    reporter: User
    dueDate?: string
    estimatedHours?: number
    actualHours?: number
    tags: string[]
    attachments: Attachment[]
    comments: TaskComment[]
    activities: TaskActivity[]
    createdAt: string
    updatedAt: string
  }
}
```

#### POST /api/tasks
Yeni görev oluştur

**Request Body:**
```typescript
{
  title: string
  description?: string
  priority?: TaskPriority
  assigneeId?: string
  dueDate?: string
  estimatedHours?: number
  tags?: string[]
}
```

#### PUT /api/tasks/:id
Görev güncelle

#### DELETE /api/tasks/:id
Görev sil

#### POST /api/tasks/:id/comments
Görev yorumu ekle

**Request Body:**
```typescript
{
  content: string
  type?: 'comment' | 'system'
}
```

#### POST /api/tasks/:id/attachments
Görev eki ekle

**Form Data:**
```
file: File
description?: string
```

#### PUT /api/tasks/:id/status
Görev durumu güncelle

**Request Body:**
```typescript
{
  status: TaskStatus
  comment?: string
}
```

### Messages Module

#### GET /api/messages/conversations
Konuşma listesi

#### GET /api/messages/conversations/:id
Konuşma detayı ve mesajları

**Query Parameters:**
```typescript
{
  page?: number
  limit?: number
  before?: string // Message ID
}
```

#### POST /api/messages/conversations
Yeni konuşma başlat

**Request Body:**
```typescript
{
  participantIds: string[]
  title?: string
  type?: 'direct' | 'group'
}
```

#### POST /api/messages/conversations/:id/messages
Mesaj gönder

**Request Body:**
```typescript
{
  content: string
  type?: 'text' | 'image' | 'file'
  replyToId?: string
}
```

#### PUT /api/messages/:id/read
Mesajı okundu olarak işaretle

#### POST /api/messages/:id/reactions
Mesaja reaksiyon ekle

**Request Body:**
```typescript
{
  emoji: string
}
```

### Error Logging

#### POST /api/errors
Hata kaydı

**Request Body:**
```typescript
{
  message: string
  stack?: string
  level: 'error' | 'warning' | 'info'
  category?: string
  metadata?: Record<string, any>
}
```

#### GET /api/errors
Hata listesi (Admin only)

**Query Parameters:**
```typescript
{
  page?: number
  limit?: number
  level?: string
  category?: string
  startDate?: string
  endDate?: string
}
```

### Analytics

#### POST /api/analytics/performance
Performans metriği kaydet

**Request Body:**
```typescript
{
  type: 'performance' | 'api-performance' | 'render-performance'
  metrics: PerformanceMetrics[]
}
```

#### GET /api/analytics/performance/summary
Performans özeti (Admin only)

## ❌ Error Handling

### Error Response Format
```typescript
{
  success: false
  message: string
  errors?: string[]
  code?: string
  details?: Record<string, any>
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Examples

#### Validation Error
```typescript
{
  success: false
  message: "Validation failed"
  errors: [
    "Email is required",
    "Password must be at least 8 characters"
  ]
  code: "VALIDATION_ERROR"
}
```

#### Authentication Error
```typescript
{
  success: false
  message: "Authentication required"
  code: "UNAUTHORIZED"
}
```

#### Permission Error
```typescript
{
  success: false
  message: "Insufficient permissions"
  code: "FORBIDDEN"
  details: {
    requiredRole: "admin",
    userRole: "user"
  }
}
```

## ⚡ Rate Limiting

### Limits
- **General**: 100 requests per minute per IP
- **Auth endpoints**: 5 requests per minute per IP
- **File uploads**: 10 requests per minute per user

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1609459200
```

### Rate Limit Error
```typescript
{
  success: false
  message: "Rate limit exceeded"
  code: "RATE_LIMIT_EXCEEDED"
  details: {
    limit: 100
    reset: 1609459200
  }
}
```

## 📊 Performance

### Request/Response Times
- **Target**: < 200ms for most endpoints
- **File uploads**: < 5s for files up to 10MB
- **Complex queries**: < 1s

### Monitoring
- Performance metrics automatically collected
- Error rates tracked
- Response times monitored

### Optimization Tips
- Use pagination for large datasets
- Implement proper caching headers
- Use compression for large responses
- Minimize database queries

## 🔧 Development

### Local Testing
```bash
# Start API server
npm run server:dev

# Test endpoints
npm run test:api
```

### API Client Usage
```typescript
import { api } from './api/client'

// Get users
const users = await api.get<User[]>('/users')

// Create user
const newUser = await api.post<User>('/users', {
  email: 'user@example.com',
  fullName: 'John Doe',
  role: 'user'
})

// Upload file
const result = await api.upload('/files', file, (progress) => {
  console.log(`Upload progress: ${progress}%`)
})
```

### Error Handling
```typescript
try {
  const data = await api.get('/protected-endpoint')
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 403) {
    // Show permission error
  } else {
    // Handle other errors
  }
}
```

## 📝 Changelog

### v1.0.0 (Current)
- Initial API implementation
- Complete CRUD operations for all modules
- Real-time messaging support
- Performance monitoring
- Comprehensive error handling

---

**Note**: Bu API dokümantasyonu sürekli olarak güncellenmektedir. Yeni endpoint'ler eklendiğinde bu doküman da güncellenmelidir.
