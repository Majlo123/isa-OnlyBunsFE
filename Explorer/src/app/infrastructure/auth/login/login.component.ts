import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Login } from '../model/login.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'xp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Forma za login
  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  // Funkcija za login
  login(): void {
    // Kreiranje objekta na osnovu forme
    const login: Login = {
      username: this.loginForm.value.username || "",
      password: this.loginForm.value.password || "",
    };

    if (this.loginForm.valid) {
      this.authService.login(login).subscribe({
        next: () => {
          // Prikazivanje podataka o korisniku nakon uspešnog logovanja
          const user = this.authService.user$.value;

          console.log('Uspešno logovanje!');
          console.log('User ID:', user.id);
          console.log('Username:', user.username);
          console.log('Role:', user.role); // Dodato za prikaz role

          // Čuvanje korisničkih podataka u localStorage
          localStorage.setItem('user', JSON.stringify(user)); // Ovde se čuva rola

          // Navigacija do korisničke stranice
          this.router.navigate(['/user-account', user.id]);
        },
        error: (error: HttpErrorResponse) => {
          // Loguj grešku
          console.log('Status:', error.status);
          console.log('Backend greška:', error.error);

          // Prikazivanje poruke o grešci korisniku
          this.errorMessage = error.error; // Prikazuje "Email not verified" ili drugu grešku
        }
      });
    }
  }
}
