import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, Observable, switchMap, of, map, catchError, forkJoin, takeUntil } from 'rxjs';
import { TmdbResponse, Movie } from '../../../models/tmdb.model';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';

@Component({
  selector: 'app-trailers',
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './trailers.component.html',
  styleUrl: './trailers.component.scss'
})
export class TrailersComponent {
  trailers: any = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  selectedCategory: TrailerCategory = 'movie'; // Default to movie trailers

  private destroy$ = new Subject<void>();

  constructor(
    private movieService: TmdbApiService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadTrailers();
  }

  loadTrailers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.trailers = [];

    const mediaObservable: Observable<TmdbResponse<Movie>> =
      this.selectedCategory === 'movie'
        ? this.movieService.getNowPlayingMovies(1, 'IN') 
        : this.selectedCategory === 'tv' ? this.movieService.getAiringTodayTvShows(1) 
        : this.movieService.getUpcomming(1);

    mediaObservable.pipe(
      switchMap(response => {
        const items = response.results.slice(0, 10);
        if (items.length === 0) {
          return of([]);
        }
        // For each item, fetch its videos
        const videoRequests = items.map(item =>
          (this.selectedCategory === 'movie'
            ? this.movieService.getMovieVideos(item.id)
            : this.selectedCategory === 'tv'
            ? this.movieService.getTvShowVideos(item.id)
            : this.movieService.getUpcommingVideos(item.id)
          ).pipe(
            map(videoResponse => {
              const officialTrailer = videoResponse.results.find(
                v => v.site === 'YouTube' && v.type === 'Trailer' && v.official
              ) || videoResponse.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');

              return {
                id: item.id,
                title: (item as Movie).title || (item as Movie).name,
                posterPath: item.backdrop_path || item.poster_path,
                trailerKey: officialTrailer ? officialTrailer.key : null,
                mediaType: this.selectedCategory,
                releaseDate: item?.release_date
              }
            }),
            catchError(() => of({ // Handle error for individual video fetch
              id: item.id,
              title: (item as Movie).title || (item as Movie).name,
              posterPath: item.backdrop_path || item.poster_path,
              trailerKey: null,
              mediaType: this.selectedCategory
            })
            )
          )
        );
        return forkJoin(videoRequests);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (mediaWithTrailers) => {
        this.trailers = mediaWithTrailers.filter(item => item.trailerKey); // Only show items with a trailer
        this.isLoading = false;
        if (this.trailers.length === 0) {
          this.errorMessage = `No ${this.selectedCategory} trailers found.`;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || `Failed to load ${this.selectedCategory} trailers.`;
        this.isLoading = false;
      }
    });
  }

  selectCategory(category: TrailerCategory): void {
    if (this.selectedCategory !== category) {
      this.selectedCategory = category;
      this.loadTrailers();
    }
  }

  // Utility to get YouTube thumbnail or embed URL
  getYouTubeThumbnail(key: string | null): string {
    return key ? `https://img.youtube.com/vi/${key}/mqdefault.jpg` : 'https://via.placeholder.com/320x180.png?text=No+Trailer';
  }

  openTrailer(key: string | null): void {
    if (key) {
      window.open(`https://www.youtube.com/watch?v=${key}`, '_blank');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

export type TrailerCategory = 'movie' | 'tv' | 'Upcomming';

