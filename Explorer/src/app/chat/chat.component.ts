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

  currentUserId: number | null = null;
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
  currentPage = 0;   // page=0 -> najnovijih 10, page=1 -> starijih 10, ...
  pageSize = 10;

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
      this.loadChats();
    } else {
      console.error('User not logged in or user.id not found');
    }

    // Učitavamo sve korisnike (za kreiranje chata / dodavanje u grupu)
    this.loadAllUsers();
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
    // resetujemo messages
    this.messages = [];
    // resetujemo paginaciju na 0 (najnovije)
    this.currentPage = 0;

    // Učitamo "najnovije" poruke (page=0)
    this.loadMessages();

    // Ako je grupni i sam admin, pripremimo listu za dodavanje
    if (chat.group && chat.adminId === this.currentUserId) {
      // Niko ko je već u participants, ne treba da bude na listi
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
        // Ako je page=0, pretpostavimo da dobijamo "najnovijih" 10
        // Ako je page=1, dobijamo sledećih starijih 10, itd.

        // Treba da znamo redosled: recimo, ako server šalje starije prva, pa novije kasnije,
        // treba da ubacimo ispred (unshift). Ako šalje novije prvo, treba prilagoditi.
        // Dogovori se s backend-om.

        // Primer: ako je page=0 = najnovije, backend neka šalje [najnovija, ... starija].
        // Mi želimo da prikažemo od starije prema novijoj, ili obrnuto.
        // Da pojednostavimo:
        // pretpostavimo da je stizalo od starije do novije ->
        // pa ako je page=0 = najnovije, moraćemo "obrnuti" listu i unshift.

        // recimo:
        if (this.currentPage === 0) {
          // Ako je prva stranica -> postavljamo messages
          this.messages = msgs;
        } else {
          // Inače, dodajemo starije gore (na početak)
          // -> npr. unshift ako array već ima novije
          this.messages = [...msgs, ...this.messages];
        }

        // Scroll do dna samo ako je page=0 (da vidimo najnovije)
        if (this.currentPage === 0) {
          setTimeout(() => this.scrollToBottom(), 0);
        }
      },
      error: (err) => console.error('Error loading messages:', err)
    });
  }

  loadOlderMessages(): void {
    // Samo page++ i loadMessages ponovo
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
    if (!this.selectedChat || !this.currentUserId) return;
    const msg: Message = {
      id: 0,
      senderId: this.currentUserId,
      content: this.newMessageContent.trim(),
      timestamp: '',
      chat: this.selectedChat
    };
    this.chatService.sendMessage(msg).subscribe({
      next: (created) => {
        // Ubacimo ga na kraj (ako pretpostavimo da su messages starije->novije)
        this.messages.push(created);
        this.newMessageContent = '';
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (err) => console.error('Error sending message:', err),
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
          // Sada ponovo filtriramo userListForAdding, da ne ostane u njoj
          this.userListForAdding = this.userListForAdding.filter(u => u.id !== uId);

          // Možemo logovati poslednjih 10 poruka, ako želimo:
          this.chatService.getLatestMessages(updatedChat.id).subscribe({
            next: (last10) => {
              console.log(`User ${uId} sada vidi ovih 10 poruka: `, last10);
            }
          });
        },
        error: (err) => console.error('Error adding user to group:', err)
      });
    }
    alert('Dodavanje završeno!');

    // Reset
    this.selectedUserIdsToAdd = [];
  }

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
        // reset
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
        // Pretpostavka: { content: UserAccount[], totalElements...}
        this.userList = resp.content;
      },
      error: (err) => console.error('Error fetching users', err),
    });
  }

  // ==================== PRIKAZ USERNAME ====================
  getSenderUsername(senderId: number): Observable<string | undefined> {
    return this.usernameCache.getUsername(senderId);
  }
}
