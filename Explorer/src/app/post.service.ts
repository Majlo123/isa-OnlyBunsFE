import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from './post.model';
import { Comment } from './comment.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/api/posts';

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  likePost(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/like`, {});
  }

  addComment(postId: number, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${postId}/comments`, comment);
  }

  getPostsByUserId(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/user/${userId}`);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updatePost(postId: number, content: string): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${postId}`, { description: content });
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.apiUrl,  post);
  }
  getPostsByFollowing(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`http://localhost:8080/api/posts/following/${userId}`);
  }

}
