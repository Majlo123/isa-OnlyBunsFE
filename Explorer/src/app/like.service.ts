import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Like } from "./like.model";


@Injectable({
    providedIn: 'root'
  })
export class LikeService {
    private apiUrl = 'http://localhost:8080/api/likes';

    constructor(private http: HttpClient) {}

    getLikes(): Observable<Like[]> {
        return this.http.get<Like[]>(this.apiUrl)
    }
}