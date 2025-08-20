import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, Observable, switchMap, of, map, catchError, forkJoin, takeUntil } from 'rxjs';
import { TmdbResponse, Movie, TrailerCategory, TrailerItem } from '../../../models/tmdb.model';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { MatCardModule } from '@angular/material/card';
import { TrailerPlayerService } from '../../../services/utils/trailer-player.service';
import { HorizontalScrollComponent } from "../../shared/horizontal-scroll/horizontal-scroll.component";
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-trailers',
  imports: [
    MatButtonToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    HorizontalScrollComponent,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './trailers.component.html',
  styleUrl: './trailers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrailersComponent implements OnInit, OnDestroy {
  trailers: TrailerItem[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  selectedCategory: TrailerCategory = 'movie';

  private destroy$ = new Subject<void>();

  constructor(
    private movieService: TmdbApiService,
    private cdr: ChangeDetectorRef,
    private trailerPlayerService: TrailerPlayerService
  ) { }

  ngOnInit(): void {
    this.loadTrailers();
  }

  loadTrailers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.trailers = [];

    let mediaObservable: Observable<TmdbResponse<Movie>>;

    if (this.selectedCategory === 'movie') {
      mediaObservable = this.movieService.getNowPlayingMovies(1, 'IN');
    } else if (this.selectedCategory === 'tv') {
      mediaObservable = this.movieService.getAiringTodayTvShows(1);
    } else {
      mediaObservable = this.movieService.getUpcomming(1);
    }

    mediaObservable.pipe(
      switchMap(response => {
        const items = response.results.slice(0, 10);
        if (items.length === 0) {
          return of([]);
        }
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
                releaseDate: item?.release_date,
                vote_average: item?.vote_average
              } as TrailerItem;
            }),
            catchError(() => of({
              id: item.id,
              title: (item as Movie).title || (item as Movie).name,
              posterPath: item.backdrop_path || item.poster_path,
              trailerKey: null,
              mediaType: this.selectedCategory,
              releaseDate: item?.release_date
            } as TrailerItem)
            )
          )
        );
        return forkJoin(videoRequests);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (mediaWithTrailers: TrailerItem[]) => {
        this.trailers = mediaWithTrailers.filter(item => item.trailerKey);
        this.isLoading = false;
        if (this.trailers.length === 0) {
          this.errorMessage = `No ${this.selectedCategory} trailers found.`;
        }
        requestAnimationFrame(() => {
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.errorMessage = err.message || `Failed to load ${this.selectedCategory} trailers.`;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectCategory(category: TrailerCategory): void {
    if (this.selectedCategory !== category) {
      this.selectedCategory = category;
      this.loadTrailers();
    }
  }

  getYouTubeThumbnail(key: string | null): string {
    return key ? `https://img.youtube.com/vi/${key}/mqdefault.jpg` : 'https://via.placeholder.com/320x180.png?text=No+Trailer';
  }

  openTrailer(trailerItem: TrailerItem): void {
    // Only open if a trailerKey is available
    if (trailerItem?.trailerKey) {
      this.trailerPlayerService.openTrailerModal({
        title: trailerItem.title,
        posterPath: trailerItem.posterPath,
        trailerKey: trailerItem.trailerKey,
        isLoading: false,
        errorMessage: null
      });
    } else {
      console.warn('No trailer key available for this item (should have been filtered out):', trailerItem.title);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
