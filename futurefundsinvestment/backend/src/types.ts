export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  balance: number;
}

export interface Transaction {
  id: number;
  userId: number;
  type: 'deposit' | 'withdraw';
  provider: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  reference?: string;
}
