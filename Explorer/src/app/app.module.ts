import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { PostListComponent } from './post-list/post-list.component';
import { PostCreateComponent } from './post-create/post-create.component';
import { UserAccountComponent } from './users-list/users-list.component';
import { AppRoutingModule } from './infrastructure/routing/app-routing.module';
import { LayoutModule } from './feature-modules/layout/layout.module';
import { AuthGuard } from './infrastructure/auth/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    PostListComponent,
    PostCreateComponent,
    UserAccountComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule, // Dodaj ako koristiš reaktivne forme
    HttpClientModule,
    LayoutModule,
    AppRoutingModule
  ],
  providers: [AuthGuard], // Dodaj AuthGuard ako ga koristiš
  bootstrap: [AppComponent]
})
export class AppModule { }
