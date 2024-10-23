import { Comment } from './comment.model';

export class Post {
  id: number;
  title: string;  // Naslov posta
  content: string;  // Sadržaj posta
  imageUrl: string;  // URL slike ako postoji
  likes: number;  // Broj lajkova
  comments: Comment[];  // Lista komentara
  deleted: boolean;  // Da li je post obrisan

  constructor() {
    this.likes = 0;  // Podrazumevano 0 lajkova
    this.comments = [];  // Inicijalizujemo praznu listu komentara
    this.deleted = false;  // Podrazumevano nije obrisan
  }
}
