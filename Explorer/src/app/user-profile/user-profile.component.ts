import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../infrastructure/auth/auth.service';
import { UserInfo } from '../infrastructure/auth/model/userInfo.model';
import { User } from '../infrastructure/auth/model/user.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class ProfileComponent implements OnInit {
    email: string;
    userId: number | null = null;
    user: UserInfo;

  constructor(private authService: AuthService, private route: ActivatedRoute) { 
  }

  ngOnInit(): void { 
    console.log("INSIDE")
    this.userId = Number(this.route.snapshot.paramMap.get('userId'));
    this.getUser();
  }
  getUser(): void {
    console.log("User id: " + this.userId)
    if(this.userId !== null)
      this.authService.getEmailByUserId(this.userId).subscribe(
        (data: string) => {
          this.email = data;
          console.log("Email: " + this.email)
          this.authService.getUser(this.email).subscribe(
        (data: UserInfo) => {
          this.user = data;
        },
        (error) => {
          console.error('Error fetching user', error);
        }
      );
        }
      )
    
  }
}
