import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/env/environment";
import { UserInfo } from "../infrastructure/auth/model/userInfo.model";
import { Address } from "../infrastructure/auth/model/Address.model";
import { Registration } from "../infrastructure/auth/model/registration.model";

@Injectable({
    providedIn: 'root'
  })
  export class UserInfoService {

    constructor(
        private http: HttpClient,
        private router: Router
      ) {}

      changeFirstName(newUserInfo: UserInfo): Observable<string>{
        console.log(newUserInfo.email)
        return this.http.put<string>(environment.apiHost + 'changeUserInfo', newUserInfo)
      }
      changeAddress(newUserAddressInfo: UserInfo): Observable<Address> {
        return this.http.put<Address>(environment.apiHost + 'changeUserInfo/address', newUserAddressInfo)
      }
      changePassword(newUserPasswordInfo: Registration): Observable<string>{
        return this.http.put<string>(environment.apiHost + 'changeUserInfo/password', newUserPasswordInfo)
      }
  }
