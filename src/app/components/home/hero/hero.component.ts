import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
 heroTitle: string = 'Welcome to MovieDeck!';
  heroTagline: string = 'Millions of movies, TV shows and people to discover..';
  heroCtaButtonText: string = 'Explore Movies';
  heroImageUrl: string = 'assets/images/product_img.png';
}
