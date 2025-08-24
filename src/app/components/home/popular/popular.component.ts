import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
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
  imports: [
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
  movieService = inject(TmdbApiService);
  popularMedia = signal<Movie[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  selectedCategory = signal<PopularCategory>('movie');

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadPopular();
  }

  loadPopular(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.movieService.getPopular(this.selectedCategory())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TmdbResponse) => {
          this.popularMedia.set(response.results);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.message || 'Failed to load trending movies.');
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
      media_type: this.selectedCategory()
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}