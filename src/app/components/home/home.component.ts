import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { TrendingComponent } from './trending/trending.component';
import { TrailersComponent } from './trailers/trailers.component';


@Component({
  selector: 'app-home',
  imports: [HeroComponent,
    TrendingComponent,
    TrailersComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
