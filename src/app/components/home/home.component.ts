import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { TrendingComponent } from './trending/trending.component';
import { TrailersComponent } from './trailers/trailers.component';
import { PopularComponent } from "./popular/popular.component";


@Component({
  selector: 'app-home',
  imports: [HeroComponent,
    TrendingComponent,
    TrailersComponent,
    PopularComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
