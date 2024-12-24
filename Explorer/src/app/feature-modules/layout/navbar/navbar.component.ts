import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Component({
  selector: 'xp-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {

  user: User | undefined;
  cartItemCount: number = 0;
  showDropdown: string | null = null;

  // Metoda za otvaranje/zatvaranje dropdown menija
  toggleDropdown(menu: string) {
    this.showDropdown = this.showDropdown === menu ? null : menu;
  }

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Pretplata na korisnika
    this.authService.user$.subscribe(user => {
      this.user = user;

      // Provera korisničkih podataka u konzoli
      console.log('User object:', this.user);
      console.log('User role:', this.user.role);
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  // Proveri da li je korisnik administrator
  isAdmin(): boolean {
    return this.user?.role?.trim().toLowerCase() === 'administrator'; // Ignoriše razmake i veličinu slova
  }
  isUser(): boolean {
    return this.user?.role?.trim().toLowerCase() !== 'administrator'; // Ignoriše razmake i veličinu slova
  }
}
