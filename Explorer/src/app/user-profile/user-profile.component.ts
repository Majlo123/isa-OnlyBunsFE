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

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class ProfileComponent implements OnInit {
    email: string;
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

  constructor(private fb: FormBuilder, private authService: AuthService, private userInfoService: UserInfoService, private route: ActivatedRoute,private modalService: NgbModal) { 
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
      )
    
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
