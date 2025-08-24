import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, Observable, switchMap, of, map, catchError, forkJoin, takeUntil } from 'rxjs';
import { TmdbResponse, Movie, TrailerCategory, MediaCard } from '../../../models/tmdb.model';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { MatCardModule } from '@angular/material/card';
import { TrailerPlayerService } from '../../../services/utils/trailer-player.service';
import { HorizontalScrollComponent } from "../../shared/horizontal-scroll/horizontal-scroll.component";
import { FormsModule } from '@angular/forms';
import { MediaCardComponent } from "../../shared/media-card/media-card.component";

@Component({
  selector: 'app-trailers',
  imports: [
    FormsModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    HorizontalScrollComponent,
    MediaCardComponent
  ],
  templateUrl: './trailers.component.html',
  styleUrl: './trailers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrailersComponent implements OnInit, OnDestroy {
  movieService = inject(TmdbApiService);
  trailerPlayerService = inject(TrailerPlayerService);

  trailers = signal<MediaCard[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  selectedCategory = signal<TrailerCategory>('movie');

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadTrailers();
  }

  loadTrailers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.trailers.set([]);

    let mediaObservable: Observable<TmdbResponse<Movie>>;

    if (this.selectedCategory() === 'movie') {
      mediaObservable = this.movieService.getNowPlayingMovies(1, 'IN');
    } else if (this.selectedCategory() === 'tv') {
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
          (this.selectedCategory() === 'movie'
            ? this.movieService.getMovieVideos(item.id)
            : this.selectedCategory() === 'tv'
              ? this.movieService.getTvShowVideos(item.id)
              : this.movieService.getUpcommingVideos(item.id)
          ).pipe(
            map(videoResponse => {
              const officialTrailer = videoResponse.results.find(
                v => v.site === 'YouTube' && v.type === 'Trailer' && v.official
              ) || videoResponse.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');

              // return {
              //   id: item.id,
              //   title: (item as Movie).title || (item as Movie).name,
              //   posterPath: item.backdrop_path || item.poster_path,
              //   trailerKey: officialTrailer ? officialTrailer.key : null,
              //   mediaType: this.selectedCategory(),
              //   releaseDate: item?.release_date,
              //   vote_average: item?.vote_average
              // } as TrailerItem;
              return {
                id: item.id,
                title: item.title || item.name,
                subtitle: {
                  poster_path: item.backdrop_path || item.poster_path,
                  release_date: item?.release_date,
                  vote_average: item?.vote_average,
                },
                trailer: {
                  trailer_key: officialTrailer ? officialTrailer.key : null,
                },
                mediaType: this.selectedCategory(),
              } as MediaCard;
            }),
            catchError(() => of({
              id: item.id,
              title: (item as Movie).title || (item as Movie).name,
              subtitle: {
                poster_path: item.backdrop_path || item.poster_path,
                release_date: item?.release_date,
                vote_average: item?.vote_average,
              },
              trailer: {
                trailer_key: '',
              },
              mediaType: this.selectedCategory()
            })
            )
          )
        );
        return forkJoin(videoRequests);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (mediaWithTrailers: MediaCard[]) => {
        this.trailers.set(mediaWithTrailers.filter(item => item?.trailer?.trailer_key));
        this.isLoading.set(false);
        if (this.trailers().length === 0) {
          this.errorMessage.set(`No ${this.selectedCategory()} trailers found.`);
        }
      },
      error: (err) => {
        this.errorMessage.set(err.message || `Failed to load ${this.selectedCategory()} trailers.`);
        this.isLoading.set(false);
      }
    });
  }

  getYouTubeThumbnail(key: string | null): string {
    return key ? `https://img.youtube.com/vi/${key}/mqdefault.jpg` : 'https://via.placeholder.com/320x180.png?text=No+Trailer';
  }

  openTrailer(media: MediaCard): void {
    // Only open if a trailerKey is available
    if (media.trailer?.trailer_key) {
      this.trailerPlayerService.openTrailerModal({
        title: media.title,
        posterPath: media.subtitle.poster_path || null,
        trailerKey: media.trailer.trailer_key,
        isLoading: false,
        errorMessage: null
      });
    } else {
      console.warn('No trailer key available for this item (should have been filtered out):', media.title);
    }
  }

  getMedia(media: MediaCard): MediaCard {
    return media
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
