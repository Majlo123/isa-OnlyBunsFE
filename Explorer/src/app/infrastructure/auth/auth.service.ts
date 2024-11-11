import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenStorage } from './jwt/token.service';
import { environment } from 'src/env/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Login } from './model/login.model';
import { AuthenticationResponse } from './model/authentication-response.model';
import { User } from './model/user.model';
import { Registration } from './model/registration.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$ = new BehaviorSubject<User>({ username: "", id: 0, role: "" });
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage,
    private router: Router
  ) {}

  login(login: Login): Observable<AuthenticationResponse> {
    return this.http
      .post(environment.apiHost + 'userAccount/login', login, { responseType: 'text' })
      .pipe(
        map((response: string) => {
          if (response === "Email not verified") {
            throw new Error(response);
          }
          return { accessToken: response } as AuthenticationResponse;
        }),
        tap((authenticationResponse: AuthenticationResponse) => {
          this.tokenStorage.saveAccessToken(authenticationResponse.accessToken);
          this.setUser();
        })
      );
  }

  register(registration: Registration): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(environment.apiHost + 'users', registration)
      .pipe(
        tap((authenticationResponse) => {
          this.tokenStorage.saveAccessToken(authenticationResponse.accessToken);
          this.setUser();
        })
      );
  }

  logout(): void {
    this.router.navigate(['/home']).then(() => {
      this.tokenStorage.clear();
      this.user$.next({ username: "", id: 0, role: "" });
    });
  }

  checkIfUserExists(): void {
    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken == null) {
      return;
    }
    this.setUser();
  }

  private setUser(): void {
    const accessToken = this.tokenStorage.getAccessToken() || "";

    if (!accessToken) {
      console.error('Access token not found.');
      return;
    }

    const decodedToken = this.jwtHelper.decodeToken(accessToken);
    console.log('Decoded token:', decodedToken); // Provera sadržaja tokena

    const user: User = {
      id: +decodedToken.userId,       // Proveravamo `userId` iz tokena
      username: decodedToken.sub,     // Koristimo `sub` kao `username`
      role: decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    };

    if (isNaN(user.id)) {
      console.error("User ID is missing or invalid in the decoded token.");
      user.id = 0; // Postavljanje na 0 ako je ID nevažeći
    }

    console.log('Setting user:', user); // Provera postavljanja korisnika
    this.user$.next(user);
  }

  // Getter za ID trenutnog korisnika
  getCurrentUserId(): number {
    return this.user$.value.id;
  }
}
