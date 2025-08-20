import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  trendingMovies: Movie[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  activeTimeWindow: TimeWindow = 'day';

  private readonly destroy$ = new Subject<void>();

  constructor(public movieService: TmdbApiService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTrendingMovies();
  }

  loadTrendingMovies(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.movieService.getTrendingMovies(this.activeTimeWindow)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TmdbResponse) => {
          this.trendingMovies = response.results;
          this.isLoading = false;
          // Using requestAnimationFrame for more reliable DOM layout measurement
          requestAnimationFrame(() => {
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load trending movies.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getMedia(media: Movie): MediaCard {
    return {
      id: media.id,
      title: media.title,
      poster_path: media.poster_path,
      release_date: media.release_date || media.first_air_date,
      vote_average: media.vote_average
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

export type TimeWindow = 'day' | 'week';