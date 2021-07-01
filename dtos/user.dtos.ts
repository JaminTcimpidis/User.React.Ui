export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string; 
}

export type CreateUserRequest = {
  firstName: string;
  lastName: string;
  email: string; 
}