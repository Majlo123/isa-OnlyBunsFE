import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Registration } from '../model/registration.model';
import { OnInit } from '@angular/core';
import { Address } from '../model/Address.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit{
  registrationForm: FormGroup;
  address: Address = {
    country: '',  
    city: '',
    street: '',
    number: ''
  }
  registration: Registration = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    address: this.address
  };
  
  

  ngOnInit(): void {
    // No initialization needed here if registration is already initialized
    /*this.registration.city = '';
    this.registration.name = '';
    this.registration.surname = '';
    this.registration.password = '';
    this.registration.street = '';
    this.registration.email = '';
    this.registration.number = 0;
    this.registration.username = '';
    this.registration.country = '';*/


  }
  constructor(private fb: FormBuilder,  private authService: AuthService, private router: Router) {
    this.registrationForm = this.fb.group({
      firstName: [this.registration.firstName, Validators.required],
      lastName: [this.registration.lastName, Validators.required],
      email: [this.registration.email, [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      address: this.fb.group({
        country: [this.registration.address.country, Validators.required],
        city: [this.registration.address.city, Validators.required],
        street: [this.registration.address.street, Validators.required],
        number: [
          this.registration.address.number,
          [Validators.required, Validators.pattern('^[0-9]*$')] // Enforces numeric input
        ]
      }),
      password: [this.registration.password, Validators.required],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  get firstName() { return this.registrationForm.get('firstName'); }
  get lastName() { return this.registrationForm.get('lastName'); }
  get email() { return this.registrationForm.get('email'); }
  get country() { return this.registrationForm.get('address.country'); }
  get city() { return this.registrationForm.get('address.city'); }
  get street() { return this.registrationForm.get('address.street'); }
  get number() { return this.registrationForm.get('address.number'); }
  get password() { return this.registrationForm.get('password'); }
  get confirmPassword() { return this.registrationForm.get('confirmPassword'); }
  get username() { return this.registrationForm.get('username'); }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      console.log("Form Submitted:", this.registrationForm.value);
      // Handle registration logic here
      this.registration.firstName = this.registrationForm.get('firstName')?.value;
    this.registration.lastName = this.registrationForm.get('lastName')?.value;
    this.registration.address.city = this.registrationForm.get('address.city')?.value;
    this.registration.address.street = this.registrationForm.get('address.street')?.value;
    this.registration.address.country = this.registrationForm.get('address.country')?.value;
    this.registration.email = this.registrationForm.get('email')?.value;
    this.registration.address.number = this.registrationForm.get('address.number')?.value;
    this.registration.username = this.registrationForm.get('username')?.value;
    this.registration.password = this.registrationForm.get('password')?.value;
    console.log(this.registration)  
    this.authService.register(this.registration).subscribe({
        next: () => {
          this.router.navigate(['login']);
        },
      });
    }
  }
}
