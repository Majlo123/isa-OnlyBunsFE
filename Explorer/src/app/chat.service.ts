import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

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
  private stompClient!: Client;
  private connected = false;
  private newMessage$ = new Subject<Message>();

  constructor(private http: HttpClient) {
    this.initializeWebSocketConnection();
  }

  // Funkcija za kreiranje HTTP Header-a sa JWT tokenom
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken'); // Preuzmi JWT token iz localStorage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Dodaj token u header
    });
  }

  // ==================== WEBSOCKET KONFIGURACIJA ====================
  initializeWebSocketConnection(): void {
    const socket = () => new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {}, // Isključi logove
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);

      // Pretplati se na poruke
      this.stompClient.subscribe('/topic/messages', (message) => {
        const msg = JSON.parse(message.body);
        this.newMessage$.next(msg);
      });
    };

    this.stompClient.onStompError = (error) => {
      console.error('STOMP connection error:', error);
      setTimeout(() => this.reconnect(), 5000); // Ponovo pokušaj povezivanje
    };

    this.stompClient.activate();
  }

  sendMessage(chatId: number, senderId: number, content: string): void {
    const message = {
      chat: { id: chatId },
      senderId: senderId,
      content: content,
    };

    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify(message),
      });
      console.log('Message sent successfully:', message);
    } else {
      console.error('No WebSocket connection available to send message.');
    }
  }

  isConnected(): boolean {
    return this.stompClient && this.stompClient.connected;
  }

  subscribeToChat(chatId: number, callback: (message: any) => void): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe(`/topic/messages/${chatId}`, (message) => {
        const msg = JSON.parse(message.body);
        callback(msg);
      });
    } else {
      console.error('STOMP connection not established yet!');
    }
  }

  reconnect(): void {
    console.log('Reconnecting WebSocket...');
    this.initializeWebSocketConnection();
  }

  // ==================== HTTP API METODE ====================
  getMessagesPaginated(chatId: number, page: number, size: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.baseUrl}/chats/${chatId}/messages/paged?page=${page}&size=${size}`,
      { headers: this.getHeaders() }
    );
  }

  addUserToGroup(chatId: number, userId: number): Observable<Chat> {
    return this.http.post<Chat>(
      `${this.baseUrl}/chats/${chatId}/addUser?userId=${userId}`,
      {},
      { headers: this.getHeaders() }
    );
  }
  removeUserFromGroup(chatId: number, userId: number): Observable<Chat> {
    return this.http.delete<Chat>(
      `${this.baseUrl}/chats/${chatId}/removeUser?userId=${userId}`,
      { headers: this.getHeaders() }
    );
  }
  getLatestMessages(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.baseUrl}/messages/${chatId}/latest`,
      { headers: this.getHeaders() }
    );
  }
  getRecentMessages(chatId: number, userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.baseUrl}/chats/${chatId}/recent-messages?userId=${userId}`,
      { headers: this.getHeaders() }
    );
}

  getChatsByUserId(userId: number): Observable<Chat[]> {
    return this.http.get<Chat[]>(
      `${this.baseUrl}/chats/user/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  createChat(chat: Chat): Observable<Chat> {
    return this.http.post<Chat>(
      `${this.baseUrl}/chats`,
      chat,
      { headers: this.getHeaders() }
    );
  }
}
