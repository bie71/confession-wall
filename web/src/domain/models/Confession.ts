export type Confession = {
  id: number;
  name: string | null;
  message: string;
  likes: number;
  dislikes: number;
  createdAt: Date | string | number;
  ipHash: string | null;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
};

export type ConfessionStatus = Confession['status'];
