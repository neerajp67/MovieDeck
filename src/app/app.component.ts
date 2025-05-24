import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { TmdbApiService } from './services/api/tmdb-api.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Movie, TmdbResponse } from './models/tmdb.model';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    CommonModule,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'MovieDeck';
  popularMovies: any[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  currentPage: number = 1;
  totalPages: number = 0;

  private destroy$ = new Subject<void>();

  constructor(public tmdbService: TmdbApiService) {
    console.log('Testing environment loaded!', environment.testing);
  }

  ngOnInit(): void {
    this.loadPopularMovies();
  }

  loadPopularMovies(page: number = 1): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.currentPage = page;

    this.tmdbService.getPopularMovies(this.currentPage, 'en-US', 'IN')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TmdbResponse<Movie>) => {
          this.popularMovies = response.results;
          this.totalPages = response.total_pages;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load movies.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
