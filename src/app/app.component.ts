import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { StoreService } from './services/utils/store.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    CommonModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'MovieDeck';

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    this.storeService.loadGenre();
  }
}
