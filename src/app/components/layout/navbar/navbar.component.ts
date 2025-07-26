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
  data?: string  
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
  appLogo: string = '/assets/images/product_img.png'

  navLinks: NavLink[] = [
    { path: '/home', label: 'Home' },
    { path: '/movies', label: 'Movies'},
    { path: '/shows', label: 'TV Shows'},
    { path: '/people', label: 'People' }
  ];
}
