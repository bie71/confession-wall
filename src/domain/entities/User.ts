export type User = {
  id: number;
  name: string;
  email: string;
  password?: string; // Password should not be exposed in domain entities
  role: 'user' | 'admin';
  createdAt: Date;
};
