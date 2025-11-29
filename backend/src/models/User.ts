export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

export interface UserDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
