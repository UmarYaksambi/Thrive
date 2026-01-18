import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * These functions support multi-role users:
 * - A user can be BOTH teacher AND student simultaneously
 * - Functions return arrays of roles, not single roles
 */

export type Role = 'admin' | 'teacher' | 'student' | 'supervisor';

/**
 * Get ALL roles for the current user
 * Uses the get_user_roles() RPC that returns an array
 */
export async function getUserRoles(supabase: SupabaseClient): Promise<Role[]> {
  const { data, error } = await supabase.rpc('get_user_roles');
  if (error || !data) {
    console.error('Failed to fetch user roles:', error);
    return ['student']; // Default fallback
  }
  return data as Role[];
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(supabase: SupabaseClient, role: Role): Promise<boolean> {
  const roles = await getUserRoles(supabase);
  return roles.includes(role);
}

/**
 * Check if the current user has ANY of the specified roles
 */
export async function hasAnyRole(supabase: SupabaseClient, checkRoles: Role[]): Promise<boolean> {
  const roles = await getUserRoles(supabase);
  return checkRoles.some(r => roles.includes(r));
}

/**
 * Helper: Check if user is an admin or supervisor
 */
export const isAdmin = (roles: Role[]): boolean => {
  return roles.includes('admin') || roles.includes('supervisor');
};

/**
 * Helper: Check if user is a teacher
 */
export const isTeacher = (roles: Role[]): boolean => {
  return roles.includes('teacher');
};

/**
 * Helper: Check if user is a student
 */
export const isStudent = (roles: Role[]): boolean => {
  return roles.includes('student');
};

/**
 * Get the primary role (highest priority) for display purposes
 * This mimics the existing get_user_role() but works with the array
 */
export const getPrimaryRole = (roles: Role[]): Role => {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('supervisor')) return 'supervisor';
  if (roles.includes('teacher')) return 'teacher';
  return 'student';
};
