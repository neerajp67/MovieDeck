import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MediaCard, Movie, TmdbResponse } from '../../../models/tmdb.model';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { HorizontalScrollComponent } from "../../shared/horizontal-scroll/horizontal-scroll.component";
import { MediaCardComponent } from "../../shared/media-card/media-card.component";

@Component({
  selector: 'app-trending',
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonToggleModule,
    HorizontalScrollComponent, MediaCardComponent],
  templateUrl: './trending.component.html',
  styleUrl: './trending.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendingComponent implements OnInit, OnDestroy {
  movieService = inject(TmdbApiService);

  trendingMovies = signal<Movie[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  activeTimeWindow = signal<TimeWindow>('day');

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadTrendingMovies();
  }

  loadTrendingMovies(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.movieService.getTrendingMovies(this.activeTimeWindow())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TmdbResponse) => {
          this.trendingMovies.set(response.results);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load trending movies.';
          this.isLoading.set(false);
        }
      });
  }

  getMedia(media: Movie): MediaCard {
    return {
      id: media.id,
      title: media.title || media.name,
      subtitle: {
        poster_path: media.poster_path,
        release_date: media.release_date || media.first_air_date,
        vote_average: media.vote_average,
      },
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

export type TimeWindow = 'day' | 'week';