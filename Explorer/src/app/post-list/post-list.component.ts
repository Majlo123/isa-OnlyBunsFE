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

  constructor(private postService: PostService, private router: Router, private userService: UserAccountService, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    console.log("Current user id post list: " + this.currentUserId)
    this.getPosts();
  }

  getPosts(): void {
    this.postService.getPosts().subscribe(
      (data: Post[]) => {
        this.posts = data;
        console.log("Num of posts: " + data)
        this.posts.forEach(element => {
          
        });
      },
      (error) => {
        console.error('Error fetching posts', error);
      }
    );
    
  }
  getEmailByUserId(userId: number): string{
    var email = ''
    this.authService.getEmailByUserId(userId).subscribe(
      (data: string) => {
        email = data
      },
      (error) => {
        console.error('Error fetching posts', error)
       
      }
      )
      console.log("Email: " + email)
      return email
    
  }
  likePost(post: Post): void {
    // Proveravamo da li je korisnik već lajkovao post
    if(this.authService.getCurrentUserId() != 0){
     if (!post.likedByCurrentUser) {
          // Ako nije, uvećavamo broj lajkova i označavamo da je lajkovao
          post.likes += 1;
          post.likedByCurrentUser = true;

          // Ovde možete dodati poziv ka se rveru (ako imate backend) da sačuvate lajk
          this.postService.likePost(post.id).subscribe();
      }
  } else{
    this.router.navigate(['/login'])
  }
}


  addComment(post: Post): void {
    if(this.authService.getCurrentUserId() != 0){
    // Kreiranje novog komentara koristeći post.newCommentContent umesto this.newCommentContent
    const newComment: Comment = { id: 0, content: post.newCommentContent, userId: this.currentUserId };

    this.postService.addComment(post.id, newComment).subscribe((comment) => {
      post.comments.push(comment);  // Dodavanje komentara u specifičnu objavu
      post.newCommentContent = '';  // Resetovanje input polja za taj post
    });
  } else{
    this.router.navigate(['/login'])
  }
}


  getUsernameById(userId: number): Observable<string | undefined> {
    if (!this.usernamesCache.has(userId)) {
      const usernameSubject = new BehaviorSubject<string | undefined>(undefined);
      this.usernamesCache.set(userId, usernameSubject);
      console.log("Get username by id: " + userId);
      this.userService.getUsernameById(userId).pipe(take(1)).subscribe(
        (username) => {
          console.log("Username: " + username)
          usernameSubject.next(username);
        },
        (error) => {
          console.error(`Error fetching username for user ID ${userId}`, error);
        }
      );
    }
    return this.usernamesCache.get(userId)!.asObservable(); // Vraća Observable za async pipe
  }
}
