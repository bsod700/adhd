// Base Entity
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User roles (keeping only this as it's not defined elsewhere)
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
} 