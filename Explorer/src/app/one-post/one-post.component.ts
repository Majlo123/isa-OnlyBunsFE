import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { UserAccountService } from '../user-account.service';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { PostService } from '../post.service';
import { Router } from '@angular/router';
import { AuthService } from '../infrastructure/auth/auth.service';
import { Comment } from '../comment.model';

@Component({
  selector: 'app-popup-content',
  templateUrl: `./one-posst.component.html`,
  styleUrls: ['./one-post.component.css']
})
export class PopupContentComponent implements OnInit {
  @Input() post: Post;
  currentUserId: number = 1;
  usernamesCache: Map<number, BehaviorSubject<string | undefined>> = new Map();
  constructor(
    private postService: PostService,
    private router: Router,
    private userService: UserAccountService,
    private authService: AuthService
  ) {}


  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    console.log('Current user id post list: ' + this.currentUserId);
    
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
  likePost(post: Post): void {
    if(this.authService.getCurrentUserId() !== 0){
     if (!post.likedByCurrentUser) {
          post.likes += 1;
          post.likedByCurrentUser = true;
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
}
