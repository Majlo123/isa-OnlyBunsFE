import { Component, OnInit } from '@angular/core';
import { ChatService, Chat, Message } from '../chat.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { UserAccountService } from '../user-account.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

class UsernameCache {
  private cache: Map<number, BehaviorSubject<string | undefined>> = new Map();

  constructor(private userService: UserAccountService) {}

  getUsername(userId: number): Observable<string | undefined> {
    if (!this.cache.has(userId)) {
      const usernameSubject = new BehaviorSubject<string | undefined>(undefined);
      this.cache.set(userId, usernameSubject);

      this.userService.getUsernameById(userId).pipe(take(1)).subscribe({
        next: (username) => usernameSubject.next(username),
        error: (err) => console.error('Error fetching username', err),
      });
    }
    return this.cache.get(userId)!.asObservable();
  }
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  currentUserId: number = 0;
  chats: Chat[] = [];
  selectedChat: Chat | null = null;

  // Poruke koje prikazujemo
  messages: Message[] = [];

  // Zadnje poslate i polje
  newMessageContent: string = '';

  // Za kreiranje novog chata (checkbox)
  userList: any[] = [];
  selectedUserIds: number[] = [];
  newChatName: string = '';

  // Za dodavanje korisnika (checkbox)
  userListForAdding: any[] = [];
  selectedUserIdsToAdd: number[] = [];

  // Paginacija poruka
  currentPage = 0;
  pageSize = 10000000;

  usernameCache: UsernameCache;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private userService: UserAccountService
  ) {
    this.usernameCache = new UsernameCache(this.userService);
  }

  ngOnInit(): void {
    const user = this.authService.user$.value;
    if (user && user.id) {
      this.currentUserId = user.id;
      this.chatService.initializeWebSocketConnection(); // inicijalizuj konekciju
      this.loadChats();
    } else {
      console.error('User not logged in or user.id not found');
    }

    // Učitaj sve korisnike
    this.loadAllUsers();
  }
  waitForConnection(callback: () => void, interval = 100): void {
    if (this.chatService.isConnected()) {
      callback();
    } else {
      console.log('Waiting for WebSocket connection...');
      setTimeout(() => this.waitForConnection(callback, interval), interval);
    }
  }


  // ==================== CHATS ====================
  loadChats(): void {
    if (!this.currentUserId) return;
    this.chatService.getChatsByUserId(this.currentUserId).subscribe({
      next: (data) => {
        this.chats = data;
      },
      error: (err) => console.error('Error fetching chats:', err),
    });
  }

  openChat(chat: Chat): void {
    this.selectedChat = chat;
    this.messages = [];
    this.currentPage = 0;

    const userId = this.currentUserId;

    // Proveri da li je korisnik novi član
    this.chatService.getRecentMessages(chat.id, userId).subscribe({
      next: (msgs) => {
        this.messages = msgs.reverse(); // Prikazuje od starijih ka novijima
        this.scrollToBottom();

        // Pretplata na nove poruke preko WebSocket-a
        const waitForConnection = () => {
          if (this.chatService.isConnected()) {
            this.chatService.subscribeToChat(chat.id, (message) => {
              this.messages.push(message);
              this.scrollToBottom();
            });
          } else {
            console.warn('Waiting for WebSocket connection...');
            setTimeout(waitForConnection, 500);
          }
        };
        waitForConnection();
      },
      error: (err) => {
        console.error('Error loading messages for new member:', err);
      }
    });

    // Ako je grupni i ja sam admin, pripremi listu za dodavanje korisnika
    if (chat.group && chat.adminId === this.currentUserId) {
      this.userListForAdding = this.userList.filter(
        (u) => !chat.participants.includes(u.id) && u.id !== this.currentUserId
      );
      this.selectedUserIdsToAdd = [];
    } else {
      this.userListForAdding = [];
      this.selectedUserIdsToAdd = [];
    }
}




  // ==================== PAGINIRANE PORUKE ====================
  loadMessages(): void {
    if (!this.selectedChat) return;
    this.chatService.getMessagesPaginated(
      this.selectedChat.id,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (msgs) => {
        if (this.currentPage === 0) {
          this.messages = msgs;
        } else {
          this.messages = [...msgs, ...this.messages];
        }

        if (this.currentPage === 0) {
          setTimeout(() => this.scrollToBottom(), 0);
        }
      },
      error: (err) => console.error('Error loading messages:', err)
    });
  }

  loadOlderMessages(): void {
    if (!this.selectedChat) return;
    this.currentPage++;
    this.loadMessages();
  }

  private scrollToBottom(): void {
    const container = document.getElementById('messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // ==================== SLANJE PORUKE ====================
  sendMessage(): void {
    if (!this.selectedChat || !this.currentUserId || !this.newMessageContent.trim()) {
      console.error('Chat or user ID is missing or message is empty!');
      return;
    }

    const msg: Message = {
      id: 0,
      senderId: this.currentUserId,
      content: this.newMessageContent.trim(),
      timestamp: '',
      chat: this.selectedChat
    };

    // Sačekaj povezivanje pre slanja
    this.waitForConnection(() => {
      this.chatService.sendMessage(
        this.selectedChat!.id,
        this.currentUserId!,
        this.newMessageContent.trim()
      );
      this.newMessageContent = '';
      console.log('Message sent!');
    });
  }

  // ==================== DODAVANJE KORISNIKA U GRUPU ====================
  toggleUserSelectionForAdd(userId: number): void {
    if (this.selectedUserIdsToAdd.includes(userId)) {
      this.selectedUserIdsToAdd = this.selectedUserIdsToAdd.filter(id => id !== userId);
    } else {
      this.selectedUserIdsToAdd.push(userId);
    }
  }

  addSelectedUsersToGroup(): void {
    if (!this.selectedChat) return;
    if (!this.selectedChat.group) {
      alert('Ovo nije grupni chat!');
      return;
    }
    if (this.selectedChat.adminId !== this.currentUserId) {
      alert('Samo admin može dodavati korisnike!');
      return;
    }
    if (this.selectedUserIdsToAdd.length === 0) {
      alert('Niste odabrali nijednog korisnika!');
      return;
    }

    for (const uId of this.selectedUserIdsToAdd) {
      this.chatService.addUserToGroup(this.selectedChat.id, uId).subscribe({
        next: (updatedChat) => {
          this.selectedChat = updatedChat;
          this.userListForAdding = this.userListForAdding.filter(u => u.id !== uId);
        },
        error: (err) => console.error('Error adding user to group:', err)
      });
    }
    alert('Dodavanje završeno!');

    this.selectedUserIdsToAdd = [];
  }
  removeUserFromGroup(userId: number): void {
    if (!this.selectedChat) return;
    if (this.selectedChat.adminId !== this.currentUserId) {
      alert('Samo admin može ukloniti korisnike!');
      return;
    }

    const confirmRemove = confirm('Da li ste sigurni da želite da uklonite ovog korisnika?');
    if (!confirmRemove) return;

    this.chatService.removeUserFromGroup(this.selectedChat.id, userId).subscribe({
      next: (updatedChat) => {
        this.selectedChat = updatedChat;
        alert('Korisnik je uspešno uklonjen!');
      },
      error: (err) => console.error('Error removing user from group:', err),
    });
  }
  // ==================== KREIRANJE NOVOG CHATA ====================


  // ==================== KREIRANJE NOVOG CHATA ====================
  toggleUserSelection(userId: number): void {
    if (this.selectedUserIds.includes(userId)) {
      this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
    } else {
      this.selectedUserIds.push(userId);
    }
  }

  createNewChat(): void {
    if (!this.currentUserId || !this.newChatName.trim()) {
      alert('Unesite naziv!');
      return;
    }
    if (this.selectedUserIds.length === 0) {
      alert('Odaberite bar jednog korisnika!');
      return;
    }
    const isGroup = (this.selectedUserIds.length > 1);
    const participants = [this.currentUserId, ...this.selectedUserIds];
    const newChat: Chat = {
      id: 0,
      name: this.newChatName.trim(),
      group: isGroup,
      adminId: this.currentUserId,
      participants: participants
    };

    this.chatService.createChat(newChat).subscribe({
      next: (created) => {
        this.chats.push(created);
        alert('Novi chat kreiran!');
        this.newChatName = '';
        this.selectedUserIds = [];
      },
      error: (err) => console.error('Error creating chat:', err),
    });
  }

  // ==================== UČITAVANJE SVIH KORISNIKA ====================
  loadAllUsers(): void {
    this.userService.getAllUsers(0, 1000).subscribe({
      next: (resp) => {
        this.userList = resp.content;
      },
      error: (err) => console.error('Error fetching users', err),
    });
  }

  getSenderUsername(senderId: number): Observable<string | undefined> {
    return this.usernameCache.getUsername(senderId);
  }
}
