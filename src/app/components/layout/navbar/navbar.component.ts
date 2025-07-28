import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu'; // For the mobile menu
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  path: string,
  label: string,
  icon?: string,
}

@Component({
  selector: 'app-navbar',
  imports: [CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  appName: string = 'MOVIEDECK';
  appLogo: string = '/assets/logo/product_logo.png'

 navLinks: NavLink[] = [
    { path: '/home', label: 'Home', icon: 'home' },
    { path: '/movies', label: 'Movies', icon: 'movie' },
    { path: '/shows', label: 'TV Shows', icon: 'tv' },
    { path: '/people', label: 'People', icon: 'people' }
  ];  
}
