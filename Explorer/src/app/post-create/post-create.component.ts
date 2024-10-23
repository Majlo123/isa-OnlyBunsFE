import { Component } from '@angular/core';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent {
  postTitle: string = '';  // Dodaj postTitle promenljivu
  postContent: string = '';  // Dodaj postContent promenljivu

  constructor() { }

  createPost(): void {
    console.log("Post created with title: " + this.postTitle + " and content: " + this.postContent);
    // Implementiraj logiku za kreiranje posta ovde
  }
}
