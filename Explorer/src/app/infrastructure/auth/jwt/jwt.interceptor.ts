import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ACCESS_TOKEN } from '../../../shared/constants';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.includes('/userAccount/login') || request.url.includes('/userAccount/register') || 
    request.url.includes('/api/posts') || request.url.includes('/userAccount/getUserInfo') || 
    request.url.match(new RegExp('/userAccount/\\d+/username')) || request.url.match(new RegExp('/userAccount/\\d+/email'))
    || request.url.includes('/changeUserInfo') || request.url.includes('/changeUserInfo/address')
    || request.url.includes('/changeUserInfo/password') || request.url.includes('/api/likes')) {
      return next.handle(request);
    }
    const accessTokenRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ` + localStorage.getItem(ACCESS_TOKEN),
      },
    });
    return next.handle(accessTokenRequest);
  }
}