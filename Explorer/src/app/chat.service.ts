// chat.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Chat {
  id: number;
  name: string;
  group: boolean;
  adminId: number;
  participants: number[];
}

export interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  chat: Chat;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Paginirane poruke: page=0 najnovijih 10, page=1 starijih 10, ...
  getMessagesPaginated(chatId: number, page: number, size: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.baseUrl}/chats/${chatId}/messages/paged?page=${page}&size=${size}`
    );
  }

  // Dodavanje korisnika
  addUserToGroup(chatId: number, userId: number): Observable<Chat> {
    return this.http.post<Chat>(`${this.baseUrl}/chats/${chatId}/addUser?userId=${userId}`, {});
  }

  // getLatestMessages - za "vidi poslednjih 10"
  getLatestMessages(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/messages/${chatId}/latest`);
  }

  // Dohvatanje chatova po user-u
  getChatsByUserId(userId: number): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.baseUrl}/chats/user/${userId}`);
  }

  // Kreiraj chat
  createChat(chat: Chat): Observable<Chat> {
    return this.http.post<Chat>(`${this.baseUrl}/chats`, chat);
  }

  // Slanje poruke
  sendMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/messages`, message);
  }
}
