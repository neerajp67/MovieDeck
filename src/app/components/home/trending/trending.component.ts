import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { Movie, TmdbResponse } from '../../../models/tmdb.model';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { Router } from '@angular/router';
import { HorizontalScrollComponent } from "../../shared/horizontal-scroll/horizontal-scroll.component";

@Component({
  selector: 'app-trending',
  imports: [CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonToggleModule,
    HorizontalScrollComponent
  ],
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
    private readonly router: Router,
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

  navigateToDetails(item: number) {
    if (item) {
      this.router.navigate(['/', 'movie', item]);
    } else {
      console.error('Cannot navigate to detail: item or item.id is missing', item);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

export type TimeWindow = 'day' | 'week';