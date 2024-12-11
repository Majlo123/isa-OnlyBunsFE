import { Component, OnInit } from '@angular/core';
import { AuthService } from '../infrastructure/auth/auth.service';
import { UserInfo } from '../infrastructure/auth/model/userInfo.model';
import { ActivatedRoute } from '@angular/router';
import { UserAccountService } from '../user-account.service';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class ProfileComponent implements OnInit {
  email: string;
  userId: number | null = null;
  user: UserInfo;
  isFollowingUser: boolean = false; // Da li je korisnik već zapraćen
  isOwnProfile: boolean = false; // Da li korisnik gleda svoj profil
  followAttempts: number = 0; // Brojač zapraćivanja u jednom minutu
  followStartTime: number = Date.now(); // Početno vreme praćenja

  private FOLLOW_LIMIT_PER_MINUTE = 50; // Maksimalni broj praćenja po minuti

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private userAccountService: UserAccountService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('userId'));
    const currentUserId = this.authService.getCurrentUserId();

    // Proveravamo da li korisnik gleda svoj profil
    this.isOwnProfile = this.userId === currentUserId;

    if (!this.isOwnProfile) {
      this.checkFollowingStatus(); // Proverava status praćenja samo ako nije sopstveni profil
    }
    this.getUser();
  }

  getUser(): void {
    if (this.userId !== null) {
      this.authService.getEmailByUserId(this.userId).subscribe(
        (data: string) => {
          this.email = data;
          this.authService.getUser(this.email).subscribe(
            (data: UserInfo) => {
              this.user = data;
            },
            (error) => {
              console.error('Error fetching user', error);
            }
          );
        }
      );
    }
  }

  // Proverava da li trenutni korisnik prati korisnika čiji profil gleda
  checkFollowingStatus(): void {
    const currentUserId = this.authService.getCurrentUserId();
    if (currentUserId && this.userId) {
      this.userAccountService.isFollowing(currentUserId, this.userId).subscribe(
        (follows: boolean) => {
          this.isFollowingUser = follows;
        },
        (error) => console.error('Error checking follow status', error)
      );
    }
  }

  follow(): void {
    const currentUserId = this.authService.getCurrentUserId();
    if (currentUserId && this.userId) {
      // Proveravamo broj pokušaja u okviru jednog minuta
      const currentTime = Date.now();
      if (currentTime - this.followStartTime > 60000) {
        // Reset brojača ako je prošlo više od minuta
        this.followAttempts = 0;
        this.followStartTime = currentTime;
      }

      if (this.followAttempts >= this.FOLLOW_LIMIT_PER_MINUTE) {
        // Prekoračen limit, prikazujemo upozorenje
        alert('Prekoračili ste broj dozvoljenih praćenja po minutu (max 50). Sačekajte 1 minut pre nego što pokušate ponovo.');
        return;
      }

      // Uvećavamo brojač i nastavljamo sa praćenjem
      this.followAttempts++;

      // Prikazujemo trenutni broj praćenja u konzoli
      console.log(`Broj zapraćivanja u trenutnom minutu: ${this.followAttempts}`);

      this.userAccountService.followUser(currentUserId, this.userId).subscribe(
        () => {
          console.log('Follow successful');
          this.isFollowingUser = true;
        },
        (error) => {
          console.error('Error following user', error);
        }
      );
    }
  }

  unfollow(): void {
    const currentUserId = this.authService.getCurrentUserId();
    if (currentUserId && this.userId) {
      // Uklanjanje praćenja ne utiče na broj pokušaja
      this.userAccountService.unfollowUser(currentUserId, this.userId).subscribe(
        () => {
          console.log('Unfollow successful');
          this.isFollowingUser = false;
        },
        (error) => console.error('Error unfollowing user', error)
      );
    }
  }
}
