# Component Dokümantasyonu

Bu dokümant Dernek Yönetim Paneli'nde kullanılan React bileşenlerinin detaylı açıklamalarını içerir.

## 📋 İçindekiler

- [Dizin Yapısı](#dizin-yapısı)
- [UI Components](#ui-components)
- [Feature Components](#feature-components)
- [Performance Components](#performance-components)
- [Layout Components](#layout-components)
- [Development Guidelines](#development-guidelines)

## 📁 Dizin Yapısı

```
src/components/
├── ui/                     # Temel UI bileşenleri
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── tabs.tsx
│   └── ...
├── performance/            # Performans monitoring bileşenleri
│   ├── PerformanceMonitor.tsx
│   ├── ReactProfiler.tsx
│   └── MemoryMonitor.tsx
├── Chat/                   # Chat modülü bileşenleri
│   ├── ChatContainer.tsx
│   ├── ChatList.tsx
��   └── RealtimeChatWindow.tsx
├── meetings/               # Toplantı modülü bileşenleri
│   ├── MeetingForm.tsx
│   └── MeetingDetailModal.tsx
├── tasks/                  # Görev modülü bileşenleri
│   ├── TaskForm.tsx
│   ├── TaskDetailModal.tsx
│   └── RealtimeTaskUpdates.tsx
├── notifications/          # Bildirim bileşenleri
│   ├── NotificationCenter.tsx
│   └── NotificationSystem.tsx
└── ...
```

## 🎨 UI Components

### Button

Modern, accessible button bileşeni.

```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}
```

**Kullanım:**
```tsx
import { Button } from '../ui/button'

<Button variant="default" size="lg" loading={isLoading}>
  Kaydet
</Button>
```

**Variants:**
- `default`: Primary blue button
- `destructive`: Red danger button
- `outline`: Bordered button
- `secondary`: Gray secondary button
- `ghost`: Transparent button
- `link`: Link-style button

### Card

Içerik container'ı için card bileşeni.

```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}
```

**Kullanım:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

<Card>
  <CardHeader>
    <CardTitle>Başlık</CardTitle>
  </CardHeader>
  <CardContent>
    <p>İçerik buraya gelir</p>
  </CardContent>
</Card>
```

### Badge

Status ve etiket gösterimi için badge bileşeni.

```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  children: React.ReactNode
  className?: string
}
```

**Kullanım:**
```tsx
import { Badge } from '../ui/badge'

<Badge variant="destructive">Urgent</Badge>
<Badge variant="secondary">In Progress</Badge>
```

### Tabs

Tab navigation bileşeni.

```typescript
interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}
```

**Kullanım:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'

<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Tab 1 content</TabsContent>
  <TabsContent value="tab2">Tab 2 content</TabsContent>
</Tabs>
```

## 🚀 Feature Components

### MeetingForm

Toplantı oluşturma ve düzenleme formu.

```typescript
interface MeetingFormProps {
  meeting?: Meeting
  onSubmit: (data: MeetingFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

interface MeetingFormData {
  title: string
  description?: string
  startTime: string
  endTime: string
  location?: string
  participants: string[]
}
```

**Özellikler:**
- React Hook Form ile form validation
- Zod schema validation
- Date/time picker integration
- Participant selection
- Real-time validation

**Kullanım:**
```tsx
import MeetingForm from '../meetings/MeetingForm'

<MeetingForm
  meeting={selectedMeeting}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  loading={isSubmitting}
/>
```

### TaskForm

Görev oluşturma ve düzenleme formu.

```typescript
interface TaskFormProps {
  task?: Task
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

interface TaskFormData {
  title: string
  description?: string
  priority: TaskPriority
  assigneeId?: string
  dueDate?: string
  estimatedHours?: number
  tags: string[]
}
```

**Özellikler:**
- Priority selection
- User assignment
- Tag management
- Due date picker
- Estimated hours input

### RealtimeChatWindow

Gerçek zamanlı chat bileşeni.

```typescript
interface RealtimeChatWindowProps {
  conversationId: string
  participants: User[]
  onClose?: () => void
}
```

**Özellikler:**
- Real-time message sync
- Typing indicators
- Message reactions
- File attachments
- User presence
- Message replies

**Kullanım:**
```tsx
import RealtimeChatWindow from '../Chat/RealtimeChatWindow'

<RealtimeChatWindow
  conversationId="conv-123"
  participants={chatParticipants}
  onClose={handleCloseChat}
/>
```

### NotificationCenter

Bildirim merkezi bileşeni.

```typescript
interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onNotificationClick: (notification: Notification) => void
}
```

**Özellikler:**
- Real-time notifications
- Mark as read functionality
- Notification categorization
- Deep linking
- Badge count

## 📊 Performance Components

### PerformanceMonitor

Ana performans monitoring dashboard'u.

```typescript
interface PerformanceMonitorProps {
  // No props - self-contained component
}
```

**Özellikler:**
- Web Vitals tracking
- API performance metrics
- Memory usage monitoring
- Real-time updates
- Export functionality

**Kullanım:**
```tsx
import PerformanceMonitor from '../performance/PerformanceMonitor'

<PerformanceMonitor />
```

### ReactProfiler

React component performans tracking.

```typescript
interface ReactProfilerProps {
  id: string
  children: React.ReactNode
  enabled?: boolean
  threshold?: number
}
```

**Özellikler:**
- Component render time tracking
- Automatic slow render detection
- Development warnings
- Performance metrics collection

**Kullanım:**
```tsx
import ReactProfilerWrapper from '../performance/ReactProfiler'

<ReactProfilerWrapper id="expensive-component" threshold={16}>
  <ExpensiveComponent />
</ReactProfilerWrapper>
```

### MemoryMonitor

Bellek kullanımı monitoring bileşeni.

```typescript
interface MemoryMonitorProps {
  // No props - self-contained component
}
```

**Özellikler:**
- JavaScript heap monitoring
- DOM node count tracking
- Memory usage trends
- Garbage collection triggers
- Memory leak detection

## 🏗️ Layout Components

### DashboardLayout

Ana dashboard layout wrapper'ı.

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
}
```

**Özellikler:**
- Responsive design
- Sidebar management
- Header integration
- Mobile navigation
- Breadcrumb support

### ErrorBoundary

React error boundary bileşeni.

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}
```

**Özellikler:**
- Error catching
- Fallback UI
- Error reporting
- Recovery options

**Kullanım:**
```tsx
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './ErrorFallback'

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

## 🔧 Development Guidelines

### Component Creation

#### 1. Naming Convention
```typescript
// PascalCase for components
export default function UserProfile() {}

// camelCase for hooks
export function useUserData() {}

// kebab-case for files
user-profile.tsx
use-user-data.ts
```

#### 2. TypeScript Types
```typescript
// Props interface
interface ComponentProps {
  // Required props
  id: string
  title: string
  
  // Optional props
  description?: string
  onClick?: () => void
  
  // Children
  children?: React.ReactNode
  
  // Style customization
  className?: string
}

// Forward ref when needed
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    )
  }
)
```

#### 3. Component Structure
```typescript
import React from 'react'
import { cn } from '../../utils/classNames'

interface ComponentProps {
  // Props interface
}

export default function Component({ prop1, prop2, ...props }: ComponentProps) {
  // State
  const [state, setState] = React.useState()
  
  // Effects
  React.useEffect(() => {
    // Effect logic
  }, [])
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  }
  
  // Render helpers
  const renderSubComponent = () => {
    return <div>Sub component</div>
  }
  
  // Main render
  return (
    <div className={cn('base-classes', props.className)}>
      {renderSubComponent()}
    </div>
  )
}
```

### Performance Best Practices

#### 1. Memoization
```typescript
// React.memo for component memoization
export default React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* Expensive rendering */}</div>
})

// useMemo for expensive calculations
const expensiveValue = React.useMemo(() => {
  return heavyCalculation(data)
}, [data])

// useCallback for event handlers
const handleClick = React.useCallback(() => {
  // Handler logic
}, [dependency])
```

#### 2. Lazy Loading
```typescript
// Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

#### 3. Performance Monitoring
```typescript
// Use ReactProfiler for performance tracking
import { withReactProfiler } from '../performance/ReactProfiler'

const ProfiledComponent = withReactProfiler(MyComponent, 'MyComponent')
```

### Testing Guidelines

#### 1. Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Component from './Component'

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
  
  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<Component onClick={handleClick} />)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

#### 2. Mock External Dependencies
```typescript
// Mock API calls
vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: mockData,
    isLoading: false,
    error: null
  }))
}))
```

### Accessibility Guidelines

#### 1. Semantic HTML
```typescript
// Use semantic elements
<main>
  <section>
    <h1>Page Title</h1>
    <article>
      <h2>Article Title</h2>
      <p>Content</p>
    </article>
  </section>
</main>
```

#### 2. ARIA Attributes
```typescript
// Proper ARIA usage
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  aria-controls="dialog-content"
  onClick={handleClose}
>
  <CloseIcon />
</button>

<div
  id="dialog-content"
  role="dialog"
  aria-labelledby="dialog-title"
  aria-modal="true"
>
  <h2 id="dialog-title">Dialog Title</h2>
</div>
```

#### 3. Keyboard Navigation
```typescript
// Handle keyboard events
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Escape') {
    handleClose()
  }
  if (event.key === 'Enter' || event.key === ' ') {
    handleAction()
  }
}

<div
  tabIndex={0}
  onKeyDown={handleKeyDown}
  role="button"
>
  Interactive Element
</div>
```

### Styling Guidelines

#### 1. Tailwind Classes
```typescript
// Use utility-first approach
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900">Title</h3>
  <Button variant="outline" size="sm">Action</Button>
</div>
```

#### 2. Conditional Classes
```typescript
import { cn } from '../../utils/classNames'

const className = cn(
  'base-classes',
  {
    'conditional-class': condition,
    'another-class': anotherCondition
  },
  props.className
)
```

#### 3. Responsive Design
```typescript
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>

<p className="text-sm md:text-base lg:text-lg">
  Responsive text
</p>
```

---

**Note**: Bu component dokümantasyonu projedeki tüm önemli bileşenleri kapsar. Yeni bileşenler eklendiğinde bu doküman güncellenmeli ve component'lar için test yazılmalıdır.
