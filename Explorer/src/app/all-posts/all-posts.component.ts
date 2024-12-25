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
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.css']
})
export class AllPostsComponent implements OnInit {
  posts: Post[] = [];
  newCommentContent: string = '';
  currentUserId: number = 1;
  usernamesCache: Map<number, BehaviorSubject<string | undefined>> = new Map();
  canComment: boolean = true;

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
    this.postService.getPosts().subscribe(
      (data: Post[]) => {
        this.posts = data;
        console.log("Num of posts: " + data.length);
      },
      (error) => {
        console.error('Error fetching posts', error);
      }
    );
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

  markAdvertisable(post: Post): void {
    this.postService.markAdvertisable(post.id).subscribe({
      next: () => {
        alert("You have successfully marked post as advertisable!");
      },
      error: (error) => {
        console.log(error)
      
      }
      })
  }
}
