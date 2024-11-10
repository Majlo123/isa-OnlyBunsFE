import { Component, OnInit } from '@angular/core';
import { PostService } from '../post.service';
import { Post } from '../post.model';
import { Comment } from '../comment.model';
import { UserAccountService } from '../user-account.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  posts: Post[] = [];
  newCommentContent: string = '';
  currentUserId: number = 1;
  username: string = ''; // Add this line to define the username property

  constructor(private postService: PostService, private userService: UserAccountService) { }

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
    this.postService.likePost(post.id).subscribe(() => {
      post.likes += 1;
    });
  }

  addComment(post: Post): void {
    const newComment: Comment = { id: 0, content: this.newCommentContent, userId: this.currentUserId };

    this.postService.addComment(post.id, newComment).subscribe((comment) => {
        post.comments.push(comment);
        this.newCommentContent = '';
    });
  }

  getUsernameById(userId: number): void {
    this.userService.getUsernameById(userId).subscribe(username => {
      console.log(username);
      this.username = username; // Now this.username is defined and can be used
    });
  }
}
