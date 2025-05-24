import { Component } from '@angular/core';
import { TrendingComponent } from '../trending/trending.component';
import { HeroComponent } from '../hero/hero.component';

@Component({
  selector: 'app-home',
  imports: [HeroComponent,
    TrendingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
