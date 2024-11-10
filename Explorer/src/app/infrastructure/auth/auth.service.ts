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
import { FormGroup } from '@angular/forms';
import { UserInfo } from './model/userInfo.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$ = new BehaviorSubject<User>({username: "", id: 0, role: "" });

  constructor(private http: HttpClient,
    private tokenStorage: TokenStorage,
    private router: Router) { }

    login(login: Login): Observable<AuthenticationResponse> {
      console.log(login);
      return this.http
        .post(environment.apiHost + 'userAccount/login', login, { responseType: 'text' })
        .pipe(
          map((response: string) => {
            if (response === "Email not verified") {
              throw new Error(response);  // Handle unauthorized access
            }
            // Convert response to AuthenticationResponse
            return { accessToken: response } as AuthenticationResponse;
          }),
          tap((authenticationResponse: AuthenticationResponse) => {
            console.log("Token:", authenticationResponse.accessToken);
            this.tokenStorage.saveAccessToken(authenticationResponse.accessToken);
            this.setUser();
          })
        );
    }
  

  register(registration: Registration): Observable<AuthenticationResponse> {
    console.log("REGISTER" + registration)
    return this.http
    .post<AuthenticationResponse>(environment.apiHost + 'userAccount/register', registration)
    
  }

  logout(): void {
    this.router.navigate(['/home']).then(_ => {
      this.tokenStorage.clear();
      this.user$.next({username: "", id: 0, role: "" });
      }
    );
  }
  getUser(email: string | null): Observable<UserInfo> {
    const emailParam = email ? encodeURIComponent(email) : '';
    return this.http.get<UserInfo>(`${environment.apiHost}userAccount/getUserInfo?email=${emailParam}`);
}
  checkIfUserExists(): void {
    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken == null) {
      return;
    }
    this.setUser();
  }

  
  private setUser(): void {
    const jwtHelperService = new JwtHelperService();
    const accessToken = this.tokenStorage.getAccessToken() || "";
    const user: User = {
      id: +jwtHelperService.decodeToken(accessToken).id,
      username: jwtHelperService.decodeToken(accessToken).username,
      role: jwtHelperService.decodeToken(accessToken)[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ],
    };
    this.user$.next(user);
  }
}