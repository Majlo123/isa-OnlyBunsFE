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
    email: string | null = null;

    user: UserInfo;

  constructor(private authService: AuthService, private route: ActivatedRoute) { 
  }

  ngOnInit(): void { 
    console.log("INSIDE")
    this.email = this.route.snapshot.paramMap.get('email');
    this.getUser();
  }
  getUser(): void {
    this.authService.getUser(this.email).subscribe(
        (data: UserInfo) => {
          this.user = data;
        },
        (error) => {
          console.error('Error fetching user', error);
        }
      );
  }
}
