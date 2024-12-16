import { DatePipe } from "@angular/common"
import { User } from "./infrastructure/auth/model/user.model"
import { UserInfo } from "./infrastructure/auth/model/userInfo.model"
import { Post } from "./post.model"
import { UserAccountComponent } from "./users-list/users-list.component"
export type DateArray = [number, number, number, number, number, number, number];
export class Like {
    id: number
    post: Post
    user: UserInfo
    dateLiked: DateArray
}