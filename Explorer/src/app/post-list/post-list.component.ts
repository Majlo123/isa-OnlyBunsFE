import { Component, OnInit } from '@angular/core';
import { PostService } from '../post.service';
import { Post } from '../post.model';
import { Comment } from '../comment.model';
import { UserAccountService } from '../user-account.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

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

  constructor(private postService: PostService, private userService: UserAccountService) {}

  ngOnInit(): void {
    this.getPosts();
  }

  getPosts(): void {
    this.postService.getPosts().subscribe(
      (data: Post[]) => {
        this.posts = data;
      },
      (error) => {
        console.error('Error fetching posts', error);
      }
    );
  }

  likePost(post: Post): void {
    // Proveravamo da li je korisnik već lajkovao post
    if (!post.likedByCurrentUser) {
        // Ako nije, uvećavamo broj lajkova i označavamo da je lajkovao
        post.likes += 1;
        post.likedByCurrentUser = true;

        // Ovde možete dodati poziv ka serveru (ako imate backend) da sačuvate lajk
        this.postService.likePost(post.id).subscribe();
    }
}


  addComment(post: Post): void {
    // Kreiranje novog komentara koristeći post.newCommentContent umesto this.newCommentContent
    const newComment: Comment = { id: 0, content: post.newCommentContent, userId: this.currentUserId };

    this.postService.addComment(post.id, newComment).subscribe((comment) => {
      post.comments.push(comment);  // Dodavanje komentara u specifičnu objavu
      post.newCommentContent = '';  // Resetovanje input polja za taj post
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
}
