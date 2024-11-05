import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/feature-modules/layout/home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { UserAccountComponent } from '../../users-list/users-list.component';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { PostListComponent } from '../../post-list/post-list.component'; // Import PostListComponent

const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' }, // PostListComponent kao početna stranica
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'user-account', component: UserAccountComponent, canActivate: [AuthGuard] },
  { path: 'posts', component: PostListComponent }, // Ruta za PostListComponent
  { path: '**', redirectTo: '/posts' } // Preusmerenje za nepostojeće rute
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
