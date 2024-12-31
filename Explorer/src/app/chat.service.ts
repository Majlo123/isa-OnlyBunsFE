import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  initializeWebSocketConnection(): void {
    const socket = () => new SockJS('http://localhost:8080/ws'); // Factory funkcija
    this.stompClient = new Client({
      webSocketFactory: socket, // Proslijedimo factory funkciju
      reconnectDelay: 5000,     // Pokušaj automatskog ponovnog povezivanja na 5 sekundi
      heartbeatIncoming: 4000,  // Provera ulaznih heartbeat-ova
      heartbeatOutgoing: 4000,  // Provera izlaznih heartbeat-ova
      debug: () => {}           // Isključi logove
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected: ' + frame);

      // Pretplati se na temu
      this.stompClient.subscribe('/topic/messages', (message) => {
        const msg = JSON.parse(message.body);
        this.newMessage$.next(msg);
      });
    };

    this.stompClient.onStompError = (error) => {
      console.error('STOMP connection error:', error);
      setTimeout(() => this.reconnect(), 5000); // Ponovno povezivanje
    };

    // Aktiviraj konekciju
    this.stompClient.activate();
  }



  sendMessage(chatId: number, senderId: number, content: string): void {
    const message = {
      chat: { id: chatId }, // Chat objekat sa ID-em
      senderId: senderId,
      content: content,
    };

    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify(message), // Pravilno formatirana poruka
      });
      console.log('Message sent successfully:', message); // Debug poruka
    } else {
      console.error('No WebSocket connection available to send message.');
    }
  }


  isConnected(): boolean {
    return this.stompClient && this.stompClient.connected;
  }
  getMessagesForNewMember(chatId: number, joinTimestamp: string): Observable<Message[]> {
    return this.http.get<Message[]>(`/api/messages/${chatId}/new-member?joinTime=${joinTimestamp}`);
  }

  subscribeToChat(chatId: number, callback: (message: any) => void): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.subscribe('/topic/messages/' + chatId, (message) => {
        const msg = JSON.parse(message.body);
        callback(msg);
      });
    } else {
      console.error('STOMP connection not established yet!');
    }
  }

  // HTTP API Methods
  getMessagesPaginated(chatId: number, page: number, size: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.baseUrl}/chats/${chatId}/messages/paged?page=${page}&size=${size}`
    );
  }

  addUserToGroup(chatId: number, userId: number): Observable<Chat> {
    return this.http.post<Chat>(`${this.baseUrl}/chats/${chatId}/addUser?userId=${userId}`, {});
  }

  getLatestMessages(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/messages/${chatId}/latest`);
  }

  getChatsByUserId(userId: number): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.baseUrl}/chats/user/${userId}`);
  }

  createChat(chat: Chat): Observable<Chat> {
    return this.http.post<Chat>(`${this.baseUrl}/chats`, chat);
  }

  reconnect(): void {
    console.log('Reconnecting WebSocket...');
    this.initializeWebSocketConnection(); // ponovo pokreni konekciju
  }
}
