// my-posts.component.ts
import { Component, OnInit } from '@angular/core';
import { PostService } from '../post.service';
import { UserAccountService } from '../user-account.service'; // Dodajemo UserService
import { Post } from '../post.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-my-posts',
  templateUrl: './my-posts.component.html',
  styleUrls: ['./my-posts.component.css']
})
export class MyPostsComponent implements OnInit {
  posts: Post[] = [];
  editingPostId: number | null = null;
  editedContent: string = '';
  currentUserId: number = 1;
  usernamesCache: Map<number, BehaviorSubject<string | undefined>> = new Map();

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private userService: UserAccountService // Dodajemo UserService kao dependency
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user && user.id && user.id !== 0) { // Provera da li ID postoji i nije 0
        this.loadUserPosts(user.id);
      } else {
        console.error('User ID not found. Make sure user is logged in.');
      }
    });
  }



  loadUserPosts(userId: number): void {
    this.postService.getPostsByUserId(userId).subscribe({
      next: (posts) => {
        this.posts = posts;
      },
      error: (err) => {
        console.error('Error loading user posts:', err);
      }
    });
  }


  getUsernameById(userId: number): Observable<string | undefined> {
    if (!this.usernamesCache.has(userId)) {
      const usernameSubject = new BehaviorSubject<string | undefined>(undefined);
      this.usernamesCache.set(userId, usernameSubject);

      this.userService.getUsernameById(userId).pipe(take(1)).subscribe(
        (username) => {
          usernameSubject.next(username);
        },
        (error) => {
          console.error(`Error fetching username for user ID ${userId}`, error);
        }
      );
    }
    return this.usernamesCache.get(userId)!.asObservable(); // Vraća Observable za async pipe
  }

  deletePost(postId: number): void {
    this.postService.deletePost(postId).subscribe(() => {
      this.posts = this.posts.filter(post => post.id !== postId);
    });
  }

  startEditing(post: Post): void {
    this.editingPostId = post.id;
    this.editedContent = post.description;
  }

  saveEdit(postId: number): void {
    this.postService.updatePost(postId, this.editedContent).subscribe(updatedPost => {
      const index = this.posts.findIndex(post => post.id === postId);
      if (index !== -1) {
        this.posts[index] = updatedPost;
      }
      this.editingPostId = null;
      this.editedContent = '';
    });
  }

  cancelEdit(): void {
    this.editingPostId = null;
    this.editedContent = '';
  }
}
