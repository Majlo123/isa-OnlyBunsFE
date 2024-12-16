import { Component, OnInit } from "@angular/core";
import { Post } from "../post.model";
import { PostService } from "../post.service";
import { BehaviorSubject, Observable } from "rxjs";
import { UserAccountService } from "../user-account.service";
import { take } from 'rxjs/operators';
import { Router } from "@angular/router";
import { AuthService } from "../infrastructure/auth/auth.service";
import { DateArray, Like } from "../like.model";
import { LikeService } from "../like.service";
import { PostDTO } from "../postDTO.model";
import { UserInfo } from "../infrastructure/auth/model/userInfo.model";

@Component({
    selector: 'trends',
    templateUrl: './trends.component.html',
    styleUrls: ['./trends.component.css']
  })
export class TrendsComponent implements OnInit {
    posts: PostDTO[] = []
    fiveMostPopularPosts: PostDTO[] = []
    tenMostPopularPosts: PostDTO[] = []
    likes: Like[] = []
    totalPostsCount: number = 0
    totalPostsCountInMonth: number = 0
    usersToShow: UserInfo[] = []
    likesPerUser = new Map<string, number>();
    currentUserId: number = 1;
    usernamesCache: Map<number, BehaviorSubject<string | undefined>> = new Map();
    constructor(private postService: PostService, private userService: UserAccountService, private router: Router,
        private authService: AuthService, private likeService: LikeService
    ) {}

    ngOnInit(): void {
        
        this.currentUserId = this.authService.getCurrentUserId();
        this.getPosts()
        this.getLikes()
        console.log("Most popular post: " + this.fiveMostPopularPosts.length)
    }
    getPosts(): void{
        
        this.postService.getPostsDTO().subscribe(
            (data: PostDTO[]) => {
                this.posts = data
                this.totalPostsCount = data.length
                let currentDate = new Date()
                currentDate.setMonth(currentDate.getMonth() - 1)
                
                data.forEach(post => {
                    console.log("Current date: " + this.convertToDate(post.dateOfCreation).getTime())
                    console.log("Current date less month: " + currentDate.getTime())
                    if((currentDate.getTime()) < this.convertToDate(post.dateOfCreation).getTime()){
                        this.totalPostsCountInMonth ++
                    }
                });
                currentDate = new Date()
                currentDate.setDate(currentDate.getDate()-7)
                //console.log("Set date: " + currentDate)
                let mostLikedInLastWeek = this.posts.filter(obj => (currentDate.getTime()) < this.convertToDate(obj.dateOfCreation).getTime())
                console.log("Data[0]: " + new Date())
                let maxCount = 10
                let maxCountLastWeek = 5
                //let currentDate = new Date();
                if(this.posts.length < 10){
                    maxCount = this.posts.length
                }
                if(mostLikedInLastWeek.length < 5){
                    maxCountLastWeek = mostLikedInLastWeek.length
                }
                for(let i=0;i<maxCount;i++){
                let mostPopular = this.posts[0];
                let mostPopularLastWeek = mostLikedInLastWeek[0];
                this.posts.forEach(post => {
                    if(post.likes >= mostPopular.likes){
                        mostPopular = post
                        
                    }
                    
                });
                this.posts = this.posts.filter(obj => obj !== mostPopular)
                this.tenMostPopularPosts.push(mostPopular)
                /*if(this.fiveMostPopularPosts.length < 5){
                    this.fiveMostPopularPosts.push(mostPopularLastWeek)
                }*/
            
            for(let i=0; i<maxCountLastWeek; i++){
            mostLikedInLastWeek.forEach(post => {
                if(post.likes >= mostPopularLastWeek.likes){
                    mostPopularLastWeek = post
                }
            });
            this.fiveMostPopularPosts.push(mostPopularLastWeek)
            mostLikedInLastWeek.filter(obj => obj !== mostPopularLastWeek)
        }
                console.log("Most popular post: " + this.fiveMostPopularPosts.length)     
            }
            }
        )
            
    }
    
    convertToDate(dateArray: DateArray): Date {
        const [year, month, day, hour, minute, second, nanoseconds] = dateArray;
        return new Date(
            year,
            month - 1, // Convert 1-based month to 0-based for JavaScript
            day,
            hour,
            minute,
            second,
            Math.floor(nanoseconds / 1e6) // Convert nanoseconds to milliseconds
        );
    }
    getLikes(): void {
        this.likeService.getLikes().subscribe(
            (data: Like[]) => {
                let currentDate = new Date()
                currentDate.setDate(currentDate.getDate()-7)
                data.forEach(like => {
                    let date: Date = this.convertToDate(like.dateLiked);
                    if(currentDate.getTime() < date.getTime()){
                        this.likes.push(like)
                    }
                });
                this.likes.forEach(like => {
                    const userId = like.user.email;
                    if (this.likesPerUser.has(userId)) {
                        this.likesPerUser.set(userId, this.likesPerUser.get(userId)! + 1);
                    } else {
                        this.likesPerUser.set(userId, 1);
                    }
                });
                console.log(this.likesPerUser)
                const sortedUsers = Array.from(this.likesPerUser.entries())
                .sort((a, b) => b[1] - a[1]) // Sort by like count (descending)
                .slice(0, 10);
                let currentUser: UserInfo
                sortedUsers.forEach(element => {
                    //currentUser = this.users.filter(obj => element[0] == obj.email)[0]
                    //this.usersToShow.push(currentUser)
                    this.userService.getUserInfo(element[0]).subscribe(
                        (data: UserInfo)=>{
                            this.usersToShow.push(data)
                       console.log("Users to show: " + this.usersToShow)          
                        }
                           
                    )
                }); 
                 
                }
        )
    }
    getUsernameById(userId: number): Observable<string | undefined> {
        if (!this.usernamesCache.has(userId)) {
          const usernameSubject = new BehaviorSubject<string | undefined>(undefined);
          this.usernamesCache.set(userId, usernameSubject);
          console.log("Get username by id: " + userId);
          this.userService.getUsernameById(userId).pipe(take(1)).subscribe(
            (username) => {
              console.log("Username: " + username)
              usernameSubject.next(username);
            },
            (error) => {
              console.error(`Error fetching username for user ID ${userId}`, error);
            }
          );
        }
        return this.usernamesCache.get(userId)!.asObservable(); // Vraća Observable za async pipe
      }
      likePost(post: PostDTO): void {
        // Proveravamo da li je korisnik već lajkovao post
        if(this.authService.getCurrentUserId() != 0){
         if (!post.likedByCurrentUser) {
              // Ako nije, uvećavamo broj lajkova i označavamo da je lajkovao
              post.likes += 1;
              post.likedByCurrentUser = true;
    
              // Ovde možete dodati poziv ka se rveru (ako imate backend) da sačuvate lajk
              this.postService.likePost(post.id,this.currentUserId).subscribe();
          }
      } else{
        this.router.navigate(['/login'])
      }
    }
}