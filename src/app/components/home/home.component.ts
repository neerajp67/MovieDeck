import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { TrendingComponent } from './trending/trending.component';


@Component({
  selector: 'app-home',
  imports: [HeroComponent,
    TrendingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
