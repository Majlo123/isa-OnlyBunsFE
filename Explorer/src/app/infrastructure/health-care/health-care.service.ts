import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BunnyHealthCare } from 'src/app/bunnyHealthCare.model';

@Injectable({
  providedIn: 'root'
})
export class HealthCareService {
  private apiUrl = 'http://localhost:8080/api/healthCare';
  constructor(private http: HttpClient) {}

  getInstitutions(): Observable<BunnyHealthCare[]> {
    return this.http.get<BunnyHealthCare[]>(this.apiUrl)
  }
  
}
