import { Comment } from './comment.model';

export class Post {
  id: number;
  title: string;  // Naslov posta
  description: string;  // Sadržaj posta
  imageUrl: string;  // URL slike ako postoji
  newCommentContent:string;
  likedByCurrentUser?: boolean;
  likes: number;  // Broj lajkova
  comments: Comment[];  // Lista komentara
  deleted: boolean;  // Da li je post obrisan
  userId: number;  // ID korisnika koji je kreirao post
  longitude: number;
  latitude: number;
  dateOfCreation: Date;
  imageBase64: string;

  constructor() {
    this.likes = 0;  // Podrazumevano 0 lajkova
    this.comments = [];  // Inicijalizujemo praznu listu komentara
    this.deleted = false;  // Podrazumevano nije obrisan
    this.userId = 0;  // Podrazumevano ID korisnika postavljen na 0 ili može biti null
  }
}
