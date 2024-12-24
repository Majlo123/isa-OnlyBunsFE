import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserInfo } from './infrastructure/auth/model/userInfo.model';

@Injectable({
  providedIn: 'root'
})
export class UserAccountService {
  private apiUrl = 'http://localhost:8080/api/userAccount';


  constructor(private http: HttpClient) {}
  getAllUsers(page: number, size: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&size=${size}`);
  }
  getAllAccounts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllUsers`);
  }
  searchByFirstName(firstName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/firstName`, { params: { firstName } });
  }
  searchByLastName(lastName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/lastName`, { params: { lastName } });
  }
  searchByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/email`, { params: { email } });
  }
  getUserInfo(email: string): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.apiUrl}/getUserInfo`, { params: { email } });
  }
  getUsernameById(userId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/${userId}/username`, { responseType: 'text' });
  }
  searchByPostCount(min: number, max: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('min', min);
    params = params.append('max', max);
    return this.http.get(`${this.apiUrl}/search/postCount`, { params });
  }
  sortByFollowingCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sort/followingCount`);
  }
  sortByEmail(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sort/email`);
  }
  followUser(currentUserId: number, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${currentUserId}/follow/${userId}`, {});
  }
  isFollowing(currentUserId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${currentUserId}/follows/${userId}`);
  }
  unfollowUser(currentUserId: number, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${currentUserId}/unfollow/${userId}`, {});
  }
}
