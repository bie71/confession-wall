export type Vote = {
  id: number;
  confessionId: number;
  ipHash: string;
  value: 1 | -1;
  createdAt: number;
};
