import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { StoreService } from './services/utils/store.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  storeService = inject(StoreService);

  ngOnInit(): void {
    this.storeService.loadGenre();
  }
}
