import { Component, OnInit } from '@angular/core';
import { PostService } from '../post.service';
import { Post } from '../post.model';
import { Comment } from '../comment.model';
import { UserAccountService } from '../user-account.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../infrastructure/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  newCommentContent: string = '';
  currentUserId: number = 1;
  usernamesCache: Map<number, BehaviorSubject<string | undefined>> = new Map();
  canComment: boolean = true;
  imageBlobUrls: Map<string, string> = new Map();

  constructor(
    private postService: PostService,
    private router: Router,
    private userService: UserAccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    console.log('Current user id post list: ' + this.currentUserId);
    this.getPosts();
  }

  getPosts(): void {
    this.postService.getPostsByFollowing(this.currentUserId).subscribe(
      (data: Post[]) => {
        this.posts = data;
        this.posts.forEach(post => {
          if (post.imageUrl) {
            this.postService.getPostImage(post.imageUrl).subscribe(blob => {
              const objectUrl = URL.createObjectURL(blob);
              this.imageBlobUrls.set(post.imageUrl, objectUrl);
            });
          }
        });
      },
      (error) => {
        console.error('Error fetching posts', error);
      }
    );
  }


  getImageUrl(imageUrl: string): string | undefined {
    return this.imageBlobUrls.get(imageUrl);
  }

  likePost(post: Post): void {
    // Proveravamo da li je korisnik već lajkovao post
    if(this.authService.getCurrentUserId() !== 0){
     if (!post.likedByCurrentUser) {
          // Ako nije, uvećavamo broj lajkova i označavamo da je lajkovao
          post.likes += 1;
          post.likedByCurrentUser = true;

          // Ovde možete dodati poziv ka se rveru (ako imate backend) da sačuvate lajk
          this.postService.likePost(post.id,this.currentUserId).subscribe();
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  addComment(post: Post): void {
    if (this.authService.getCurrentUserId() !== 0) {
      const newComment: Comment = { id: 0, content: post.newCommentContent, userId: this.currentUserId, createdAt: new Date() };

      this.postService.addComment(post.id, newComment).subscribe({
        next: (comment) => {
          post.comments.push(comment);
          post.newCommentContent = '';
          console.log('Comment added by user ID:', comment.userId);
        },
        error: (error) => {
          if (error.status === 400) {
            alert('You have reached the limit of 60 comments per hour.');
          }
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  getUsernameById(userId: number): Observable<string | undefined> {
    if (!this.usernamesCache.has(userId)) {
      const usernameSubject = new BehaviorSubject<string | undefined>(undefined);
      this.usernamesCache.set(userId, usernameSubject);
      console.log('Get username by id: ' + userId);
      this.userService.getUsernameById(userId).pipe(take(1)).subscribe(
        (username) => {
          console.log('Username: ' + username);
          usernameSubject.next(username);
        },
        (error) => {
          console.error(`Error fetching username for user ID ${userId}`, error);
        }
      );
    }
    return this.usernamesCache.get(userId)!.asObservable();
  }
}
