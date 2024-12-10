export class Comment {
  id: number;
  content: string;
  userId: number;
  createdAt: Date;

  constructor() {
    this.userId = 0;
  }
}
