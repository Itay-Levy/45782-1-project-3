export interface Vacation {
  id?: number;
  destination: string;
  description: string;
  startDate: Date | string;
  endDate: Date | string;
  price: number;
  imageFileName: string;
  followersCount?: number;
  isFollowing?: boolean;
}

export interface VacationInput {
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
}
