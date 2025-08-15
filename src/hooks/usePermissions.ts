import { useAuthStore } from '../store/auth'
import type { UserRole } from '../types/permissions'
import { log } from '@/utils/logger'

export const usePermissions = () => {
  const { profile } = useAuthStore()
  
  const userRole = profile?.role as UserRole | undefined
  
  // Define role hierarchy (higher number = more permissions)
  const roleHierarchy: Record<UserRole, number> = {
    viewer: 1,
    operator: 2,
    coordinator: 3,
    manager: 4,
    admin: 5,
    super_admin: 6
  }
  
  const getRoleLevel = (role?: UserRole): number => {
    return role ? roleHierarchy[role] || 0 : 0
  }
  
  const currentRoleLevel = getRoleLevel(userRole)
  
  // Check if user has permission for a specific action
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!userRole) return false
    return currentRoleLevel >= getRoleLevel(requiredRole)
  }
  
  // Check if user can access admin features
  const canAccessAdmin = (): boolean => {
    return hasPermission('admin')
  }
  
  // Check if user can manage users
  const canManageUsers = (): boolean => {
    return hasPermission('manager')
  }
  
  // Check if user can view system settings
  const canViewSystemSettings = (): boolean => {
    return hasPermission('coordinator')
  }
  
  // Check if user can perform operations
  const canPerformOperations = (): boolean => {
    return hasPermission('operator')
  }
  
  // Check if user can only view
  const isViewerOnly = (): boolean => {
    return userRole === 'viewer'
  }
  
  // Check if user is super admin
  const isSuperAdmin = (): boolean => {
    return userRole === 'super_admin'
  }
  
  // Check if user is admin or above
  const isAdmin = (): boolean => {
    return hasPermission('admin')
  }
  
  return {
    userRole,
    currentRoleLevel,
    hasPermission,
    canAccessAdmin,
    canManageUsers,
    canViewSystemSettings,
    canPerformOperations,
    isViewerOnly,
    isSuperAdmin,
    isAdmin
  }
}
