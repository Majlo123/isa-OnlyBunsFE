import { Component, OnInit } from '@angular/core';
import { UserAccountService } from '../user-account.service';

@Component({
  selector: 'app-user-account',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UserAccountComponent implements OnInit {
  users: any[] = [];
  page: number = 0; // Početna stranica je 0 za backend
  pageSize: number = 5;
  totalItems: number = 0;

  searchParams = {
    firstName: '',
    lastName: '',
    email: '',
    minPosts: null,
    maxPosts: null
  };

  constructor(private userAccountService: UserAccountService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userAccountService.getAllUsers(this.page, this.pageSize).subscribe(data => {
      this.users = data.content; // Pretpostavljamo da je odgovor u formatu Page<UserAccount>
      this.totalItems = data.totalElements;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  searchUsers(): void {
    if (this.searchParams.firstName) {
      this.userAccountService.searchByFirstName(this.searchParams.firstName).subscribe(data => this.users = data);
    } else if (this.searchParams.lastName) {
      this.userAccountService.searchByLastName(this.searchParams.lastName).subscribe(data => this.users = data);
    } else if (this.searchParams.email) {
      this.userAccountService.searchByEmail(this.searchParams.email).subscribe(data => this.users = data);
    } else if (this.searchParams.minPosts !== null || this.searchParams.maxPosts !== null) {
      const min = this.searchParams.minPosts ?? 0;
      const max = this.searchParams.maxPosts ?? Number.MAX_SAFE_INTEGER;
      this.userAccountService.searchByPostCount(min, max).subscribe(data => this.users = data);
    }
  }

  sortUsersByFollowingCount(): void {
    this.userAccountService.sortByFollowingCount().subscribe(data => this.users = data);
  }

  sortUsersByEmail(): void {
    this.userAccountService.sortByEmail().subscribe(data => this.users = data);
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadUsers();
    }
  }
}
