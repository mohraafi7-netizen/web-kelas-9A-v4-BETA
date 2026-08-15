export type UserRole = 'member' | 'admin' | 'main_admin';

export function canManageUsers(role: UserRole | null | undefined): boolean {
  return role === 'main_admin';
}

export function canManageTasks(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'main_admin';
}

export function canManagePiket(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'main_admin';
}

export function canManageAnnouncements(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'main_admin';
}

export function canManageMessages(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'main_admin';
}

export function canManageProjects(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'main_admin';
}

export function canManageGallery(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'main_admin';
}

export function canManageAttendance(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'main_admin';
}

export function canManageSettings(role: UserRole | null | undefined): boolean {
  return role === 'main_admin';
}

export function canViewAdminPanel(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'main_admin';
}

export function canManageRoles(role: UserRole | null | undefined): boolean {
  return role === 'main_admin';
}

export function canUploadFiles(role: UserRole | null | undefined): boolean {
  return role === 'admin' || role === 'main_admin';
}
