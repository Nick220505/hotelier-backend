export interface UserCreateData {
  email: string;
  password: string;
  guestName?: string;
  guestPhone?: string;
  isActive?: boolean;
}
