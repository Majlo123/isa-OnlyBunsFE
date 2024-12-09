import { Component } from '@angular/core';
import { PostService } from '../post.service';
import { Post } from '../post.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../infrastructure/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent {

  postForm = new FormGroup({
    description: new FormControl('', [Validators.required]),
    longitude: new FormControl(0.0, [Validators.required]),
    latitude: new FormControl(0.0, [Validators.required]),
    imageBase64: new FormControl('', [Validators.required]),
    imageUrl: new FormControl('', [Validators.required])
  });

  imageBase64: string;

  constructor(private service: PostService, private auth: AuthService) { }



  createPost(): void {
    const newPost: Post = {
      id: 0,
      title: "",
      description: this.postForm.value.description || '',
      imageUrl: this.postForm.value.imageUrl || '',
      newCommentContent: '',
      likedByCurrentUser: false,
      likes: 0,
      comments: [],
      deleted: false,
      userId: this.auth.getCurrentUserId() || 0,
      longitude: this.postForm.value.longitude || 0,
      latitude: this.postForm.value.latitude || 0,
      dateOfCreation: new Date(),
      imageBase64: this.postForm.value.imageBase64 || ''
    };

    console.log(newPost)
    this.service.createPost(newPost).subscribe({

    })
  }

  onFileSelected(event: any){
    const file:File = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        this.imageBase64 = reader.result as string;
        this.postForm.patchValue({
          imageBase64: this.imageBase64
        });
    };
    reader.readAsDataURL(file); 
}
}
