import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostCreateComponent } from './post-create/post-create.component';
import { ProfileComponent } from './user-profile/user-profile.component';
import { UserAccountComponent } from './users-list/users-list.component';
import { AppRoutingModule } from './infrastructure/routing/app-routing.module';
import { LayoutModule } from './feature-modules/layout/layout.module';
import { AuthGuard } from './infrastructure/auth/auth.guard';
import { AuthModule } from './infrastructure/auth/auth.module';
import { JwtInterceptor } from './infrastructure/auth/jwt/jwt.interceptor';
import { MyPostsComponent } from './my-posts/my-posts.component';
import { NgChartsModule } from 'ng2-charts';
import { TrendsComponent } from './trends/trends.component';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AllPostsComponent } from './all-posts/all-posts.component'; // Import this

@NgModule({
  declarations: [
    AppComponent,
    PostListComponent,
    PostCreateComponent,
    UserAccountComponent,
    MyPostsComponent,
    ProfileComponent,
    TrendsComponent,
    AnalyticsComponent,
    AllPostsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AuthModule,
    NgChartsModule,
    ReactiveFormsModule, // Dodaj ako koristiš reaktivne forme
    HttpClientModule,
    LayoutModule,
    CommonModule ,
    AppRoutingModule,
    MatInputModule,
    BrowserAnimationsModule
  ],
  providers: [AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ], // Dodaj AuthGuard ako ga koristiš
  bootstrap: [AppComponent]
})
export class AppModule { }
