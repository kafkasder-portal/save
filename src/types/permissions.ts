// User roles and permissions system
export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'coordinator'
  | 'operator'
  | 'viewer'

export type Permission = 
  // Dashboard
  | 'dashboard:view'
  
  // Beneficiaries
  | 'beneficiaries:view'
  | 'beneficiaries:create'
  | 'beneficiaries:edit'
  | 'beneficiaries:delete'
  | 'beneficiaries:export'
  
  // Applications
  | 'applications:view'
  | 'applications:create'
  | 'applications:edit'
  | 'applications:delete'
  | 'applications:approve'
  | 'applications:reject'
  
  // Donations
  | 'donations:view'
  | 'donations:create'
  | 'donations:edit'
  | 'donations:delete'
  | 'donations:manage_vault'
  
  // Aid Records
  | 'aid:view'
  | 'aid:create'
  | 'aid:edit'
  | 'aid:delete'
  | 'aid:distribute'
  | 'aid:approve'
  
  // Messages
  | 'messages:view'
  | 'messages:send'
  | 'messages:bulk_send'
  | 'messages:templates'
  
  // Scholarship
  | 'scholarship:view'
  | 'scholarship:create'
  | 'scholarship:edit'
  | 'scholarship:delete'
  
  // Fund Management
  | 'fund:view'
  | 'fund:create'
  | 'fund:edit'
  | 'fund:delete'
  | 'fund:transfer'
  
  // Reports
  | 'reports:view'
  | 'reports:create'
  | 'reports:export'
  
  // System & Definitions
  | 'system:view'
  | 'system:edit'
  | 'definitions:view'
  | 'definitions:edit'
  
  // User Management
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'users:manage_roles'
  
  // Meetings
  | 'meetings:view'
  | 'meetings:create'
  | 'meetings:edit'
  | 'meetings:delete'
  | 'meetings:invite'
  | 'meetings:manage'
  
  // Internal Messages
  | 'internal_messages:view'
  | 'internal_messages:send'
  | 'internal_messages:create_group'
  | 'internal_messages:manage_groups'
  
  // Tasks
  | 'tasks:view'
  | 'tasks:create'
  | 'tasks:assign'
  | 'tasks:edit'
  | 'tasks:delete'
  | 'tasks:complete'
  | 'tasks:manage'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // All permissions
    'dashboard:view',
    'beneficiaries:view', 'beneficiaries:create', 'beneficiaries:edit', 'beneficiaries:delete', 'beneficiaries:export',
    'applications:view', 'applications:create', 'applications:edit', 'applications:delete', 'applications:approve', 'applications:reject',
    'donations:view', 'donations:create', 'donations:edit', 'donations:delete', 'donations:manage_vault',
    'aid:view', 'aid:create', 'aid:edit', 'aid:delete', 'aid:distribute', 'aid:approve',
    'messages:view', 'messages:send', 'messages:bulk_send', 'messages:templates',
    'scholarship:view', 'scholarship:create', 'scholarship:edit', 'scholarship:delete',
    'fund:view', 'fund:create', 'fund:edit', 'fund:delete', 'fund:transfer',
    'reports:view', 'reports:create', 'reports:export',
    'system:view', 'system:edit', 'definitions:view', 'definitions:edit',
    'users:view', 'users:create', 'users:edit', 'users:delete', 'users:manage_roles',
    'meetings:view', 'meetings:create', 'meetings:edit', 'meetings:delete', 'meetings:invite', 'meetings:manage',
    'internal_messages:view', 'internal_messages:send', 'internal_messages:create_group', 'internal_messages:manage_groups',
    'tasks:view', 'tasks:create', 'tasks:assign', 'tasks:edit', 'tasks:delete', 'tasks:complete', 'tasks:manage'
  ],
  
  admin: [
    'dashboard:view',
    'beneficiaries:view', 'beneficiaries:create', 'beneficiaries:edit', 'beneficiaries:delete', 'beneficiaries:export',
    'applications:view', 'applications:create', 'applications:edit', 'applications:approve', 'applications:reject',
    'donations:view', 'donations:create', 'donations:edit', 'donations:manage_vault',
    'aid:view', 'aid:create', 'aid:edit', 'aid:distribute', 'aid:approve',
    'messages:view', 'messages:send', 'messages:bulk_send', 'messages:templates',
    'scholarship:view', 'scholarship:create', 'scholarship:edit', 'scholarship:delete',
    'fund:view', 'fund:create', 'fund:edit', 'fund:transfer',
    'reports:view', 'reports:create', 'reports:export',
    'definitions:view', 'definitions:edit',
    'users:view', 'users:create', 'users:edit',
    'meetings:view', 'meetings:create', 'meetings:edit', 'meetings:delete', 'meetings:invite', 'meetings:manage',
    'internal_messages:view', 'internal_messages:send', 'internal_messages:create_group', 'internal_messages:manage_groups',
    'tasks:view', 'tasks:create', 'tasks:assign', 'tasks:edit', 'tasks:delete', 'tasks:complete', 'tasks:manage'
  ],
  
  manager: [
    'dashboard:view',
    'beneficiaries:view', 'beneficiaries:create', 'beneficiaries:edit', 'beneficiaries:export',
    'applications:view', 'applications:create', 'applications:edit', 'applications:approve',
    'donations:view', 'donations:create', 'donations:edit',
    'aid:view', 'aid:create', 'aid:edit', 'aid:distribute',
    'messages:view', 'messages:send', 'messages:bulk_send',
    'scholarship:view', 'scholarship:create', 'scholarship:edit',
    'fund:view', 'fund:create', 'fund:edit',
    'reports:view', 'reports:create', 'reports:export',
    'definitions:view',
    'users:view',
    'meetings:view', 'meetings:create', 'meetings:edit', 'meetings:invite',
    'internal_messages:view', 'internal_messages:send', 'internal_messages:create_group',
    'tasks:view', 'tasks:create', 'tasks:assign', 'tasks:edit', 'tasks:complete'
  ],
  
  coordinator: [
    'dashboard:view',
    'beneficiaries:view', 'beneficiaries:create', 'beneficiaries:edit',
    'applications:view', 'applications:create', 'applications:edit',
    'donations:view', 'donations:create',
    'aid:view', 'aid:create', 'aid:edit',
    'messages:view', 'messages:send',
    'scholarship:view', 'scholarship:create', 'scholarship:edit',
    'fund:view',
    'reports:view', 'reports:create',
    'meetings:view', 'meetings:create', 'meetings:invite',
    'internal_messages:view', 'internal_messages:send',
    'tasks:view', 'tasks:create', 'tasks:complete'
  ],
  
  operator: [
    'dashboard:view',
    'beneficiaries:view', 'beneficiaries:create',
    'applications:view', 'applications:create',
    'donations:view', 'donations:create',
    'aid:view', 'aid:create',
    'messages:view', 'messages:send',
    'scholarship:view', 'scholarship:create',
    'fund:view',
    'reports:view',
    'meetings:view',
    'internal_messages:view', 'internal_messages:send',
    'tasks:view', 'tasks:complete'
  ],
  
  viewer: [
    'dashboard:view',
    'beneficiaries:view',
    'applications:view',
    'donations:view',
    'aid:view',
    'messages:view',
    'scholarship:view',
    'fund:view',
    'reports:view',
    'meetings:view',
    'internal_messages:view',
    'tasks:view'
  ]
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  department: string | null
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Helper functions
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission))
}

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    super_admin: 'Süper Yönetici',
    admin: 'Yönetici',
    manager: 'Müdür',
    coordinator: 'Koordinatör',
    operator: 'Operatör',
    viewer: 'Görüntüleyici'
  }
  return roleNames[role] || role
}
