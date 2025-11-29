export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Vacation {
  id: number;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  imageFileName: string;
  followersCount: number;
  isFollowing: boolean;
}

export interface VacationsResponse {
  vacations: Vacation[];
  total: number;
  page: number;
  totalPages: number;
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

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ReportData {
  destination: string;
  followersCount: number;
}
