import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Address } from '../infrastructure/auth/model/Address.model';
import { AuthService } from '../infrastructure/auth/auth.service';
import { UserInfo } from '../infrastructure/auth/model/userInfo.model';
import { PostService } from '../post.service';
import { Post } from '../post.model';


@Component({
    selector: 'nearby-posts',
    templateUrl: './nearby-posts.component.html',
    styleUrls: ['./nearby-posts.component.css']
  })
  export class NearbyPostsComponent implements OnInit {
    
    address: Address
    posts: Post[]

    constructor(private http: HttpClient, private authService: AuthService, private postService: PostService) {}
    ngOnInit(): void{
      this.authService.getEmailByUserId(this.authService.user$.value.id).subscribe(
        (data: string) => {
          this.authService.getUser(data).subscribe(
            (data: UserInfo) => {
              this.address = data.address
              this.postService.getPosts().subscribe(
                (data: Post[]) => {
                  this.posts = data
                  console.log("Postovi: ", this.posts)
                }
              )
            }
          )
        }
      )
    }

    
  }