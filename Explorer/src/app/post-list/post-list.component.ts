import { Component, OnInit } from '@angular/core';
import { PostService } from '../post.service';
import { Post } from '../post.model';
import { Comment } from '../comment.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  posts: Post[] = [];
  newCommentContent: string = '';  // String vrednost za novi komentar

  constructor(private postService: PostService) { }

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
    const newComment: Comment = { id: 0, content: this.newCommentContent };

    this.postService.addComment(post.id, newComment).subscribe((comment) => {
      post.comments.push(comment);  // Lokalno dodajemo novi komentar
      this.newCommentContent = '';  // Resetujemo input za komentar
    });
  }
}
