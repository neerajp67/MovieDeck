import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MediaCard, Movie, PopularCategory, TmdbResponse } from '../../../models/tmdb.model';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { HorizontalScrollComponent } from '../../shared/horizontal-scroll/horizontal-scroll.component';
import { MediaCardComponent } from "../../shared/media-card/media-card.component";

@Component({
  selector: 'app-popular',
  imports: [CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonToggleModule,
    HorizontalScrollComponent, MediaCardComponent],
  templateUrl: './popular.component.html',
  styleUrl: './popular.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopularComponent implements OnInit, OnDestroy {
  popularMedia: Movie[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  selectedCategory: PopularCategory = 'movie';

  private readonly destroy$ = new Subject<void>();

  constructor(public movieService: TmdbApiService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPopular();
  }

  loadPopular(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.movieService.getPopular(this.selectedCategory)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TmdbResponse) => {
          this.popularMedia = response.results;
          this.isLoading = false;
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
      title: media.title || media.name,
      poster_path: media.poster_path,
      release_date: media.release_date || media.first_air_date,
      vote_average: media.vote_average,
      media_type: this.selectedCategory
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}