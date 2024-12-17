import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { AuthService } from '../infrastructure/auth/auth.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserInfo } from '../infrastructure/auth/model/userInfo.model';
import { Address } from '../infrastructure/auth/model/Address.model';
import { User } from '../infrastructure/auth/model/user.model';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs';
import { UserInfoService } from './userInfoService';
import { Registration } from '../infrastructure/auth/model/registration.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserAccountService } from '../user-account.service';
import { UserInfoId } from '../infrastructure/auth/model/userInfoId.model';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class ProfileComponent implements OnInit {
    email: string;
    isFollowingUser: boolean = false; // Da li je korisnik već zapraćen
    allFollowers: UserInfoId[] = []
    allFollowing: UserInfoId[] = []
    allUsers: UserInfoId[] = []
    showEdit: boolean = true
  isOwnProfile: boolean = false; // Da li korisnik gleda svoj profil
  followAttempts: number = 0; // Brojač zapraćivanja u jednom minutu
  followStartTime: number = Date.now(); // Početno vreme praćenja

  private FOLLOW_LIMIT_PER_MINUTE = 50; // Maksimalni broj praćenja po minuti

    registrationForm: FormGroup;
    userId: number | null = null;
    user: UserInfo;
    newUser: UserInfo = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      followersCount: 0,
      address: {
        country: '',
        city: '',
        street: '',
        number: ''
      }


      };
      registration: Registration = {
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        address: {
          country: '',
          city: '',
          street: '',
          number: ''
        }
      };

    @ViewChild('firstNameModal') firstNameModal!: TemplateRef<any>;
    @ViewChild('addressModal') addressModal!: TemplateRef<any>;
    @ViewChild('passwordModal') passwordModal!: TemplateRef<any>;

    private modalRef!: NgbModalRef;
    get password() { return this.registrationForm.get('password'); }
    get confirmPassword() { return this.registrationForm.get('confirmPassword'); }

  constructor(private userAccountService: UserAccountService, private fb: FormBuilder, private authService: AuthService, private userInfoService: UserInfoService, private route: ActivatedRoute,private modalService: NgbModal) { 
    this.registrationForm = this.fb.group({
      
      password: [this.registration.password, Validators.required],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.route.params.subscribe(() => {
      this.allUsers = []
      this.allFollowers = []
      this.allFollowing = []
      this.showEdit = true
      this.userId = Number(this.route.snapshot.paramMap.get('userId'));
      
      const currentUserId = this.authService.getCurrentUserId();
      if(currentUserId === this.userId){
        this.showEdit = true
      } else{
        this.showEdit = false
      }
      // Proveravamo da li korisnik gleda svoj profil
      this.isOwnProfile = this.userId === currentUserId;

      if (!this.isOwnProfile) {
        this.checkFollowingStatus(); // Proverava status praćenja samo ako nije sopstveni profil
      }
      this.getUser();
      this.getFollowers();

    })
    
  }

  getFollowing(): void {

  }
  getFollowers(): void {
    this.userAccountService.getAllAccounts().subscribe(
      (data: UserInfoId []) => {
        this.allUsers = data
        console.log(data)
        data.forEach(user => {
          if(this.userId){
          this.userAccountService.isFollowing(user.id, this.userId).subscribe(
        (follows: boolean) => {
          if(follows){
            this.allFollowers.push(user)
          }
        })
        this.userAccountService.isFollowing(this.userId, user.id).subscribe(
          (follows: boolean) => {
            if(follows){
              this.allFollowing.push(user)
            }
          })
        }});
        
      }
    )
  }
  getUser(): void {
    if (this.userId !== null) {
      this.authService.getEmailByUserId(this.userId).subscribe(
        (data: string) => {
          this.email = data;
          this.authService.getUser(this.email).subscribe(
        (data: UserInfo) => {
          this.user = data;
          this.newUser.email = data.email;
          this.newUser.firstName = data.firstName;
          this.newUser.lastName = data.lastName;
          this.newUser.address.country = data.address.country;
          this.newUser.address.city = data.address.city;
          this.newUser.address.street = data.address.street;
          this.newUser.address.number = data.address.number;
          this.registration.email = data.email;
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
  changeFirstName(): void{
    this.userInfoService.changeFirstName(this.newUser).subscribe(
      (data: string) => {
        this.user.firstName = data;
      },
      (error) => {
        console.error('Error changing name', error);
      }
    )
    this.getUser()
     
  }
  changeAddress(): void{
    this.userInfoService.changeAddress(this.newUser).subscribe(
      (data: Address) => {
        console.log("New country: " + data.country)
      },
      (error) => {
        console.error('Error changing name', error);
      }
    )
    this.getUser()
     
  }
  
  
  
  changePassword(): void{
    this.userInfoService.changePassword(this.registration).subscribe(
      (data: string) => {

      },
    (error) => {
      console.log('Error changing password', error)
    }
    )
     
  }
  
  closeModal(): void {
    this.modalRef.close();
  }
  openFirstNameModal(): void {
    this.modalRef = this.modalService.open(this.firstNameModal);
  }
  openAddressModal(): void {
    this.modalRef = this.modalService.open(this.addressModal);
  }
  openPasswordModal(): void {
    this.modalRef = this.modalService.open(this.passwordModal);
  }
}
