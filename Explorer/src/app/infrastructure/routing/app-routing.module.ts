import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { UserAccountComponent } from '../../users-list/users-list.component';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { PostListComponent } from '../../post-list/post-list.component'; // Import PostListComponent
import { MyPostsComponent } from '../../my-posts/my-posts.component';
import { ProfileComponent } from 'src/app/user-profile/user-profile.component';

const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' }, // PostListComponent kao početna stranica
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'user-account', component: UserAccountComponent, canActivate: [AuthGuard] },
  { path: 'posts', component: PostListComponent },
  { path: 'my-posts', component: MyPostsComponent },// Ruta za PostListComponent
  { path: 'user-profile/:userId', component: ProfileComponent },
  { path: '**', redirectTo: '/posts' } // Preusmerenje za nepostojeće rute
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    ReactiveFormsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
