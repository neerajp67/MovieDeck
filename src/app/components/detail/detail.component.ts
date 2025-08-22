import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { DatePipe, DecimalPipe, CurrencyPipe, NgStyle } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Subject, forkJoin, of } from 'rxjs';
import { switchMap, takeUntil, catchError, map } from 'rxjs/operators';
import { Movie, TvShow, CreditsResponse, CrewMember, TrailerItem } from '../../models/tmdb.model';
import { TmdbApiService } from '../../services/api/tmdb-api.service';
import { TrailerPlayerService } from '../../services/utils/trailer-player.service';
import { MediaCastComponent } from '../media-cast/media-cast.component';
import { MediaSimilarComponent } from "../media-similar/media-similar.component";

@Component({
  selector: 'app-detail',
  imports: [
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    NgStyle,
    MediaCastComponent,
    MediaSimilarComponent
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  movieService = inject(TmdbApiService);
  trailerPlayerService = inject(TrailerPlayerService);

  mediaItem = signal<Movie | TvShow | null>(null);
  credits = signal<CreditsResponse | null>(null);
  mainTrailer = signal<TrailerItem | null>(null);
  trailerUrl = signal<SafeResourceUrl | null>(null);
  similarItems = signal<(Movie | TvShow)[]>([]);

  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  mediaType = signal<'movie' | 'tv'>('movie');
  mediaId = signal<number | null>(null);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.data.pipe(
      switchMap(data => {
        this.mediaType.set(data['mediaType'] as 'movie' | 'tv');
        return this.route.paramMap;
      }),
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) {
          this.errorMessage.set('Invalid ID.');
          this.isLoading.set(false);
          return of(null);
        }
        this.mediaId.set(id);
        return this.fetchMediaDetails(id, this.mediaType());
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.mediaItem.set(result.details);
        this.credits.set(result.credits);
        this.mainTrailer.set({
          id: this.mediaItem()?.id,
          title: this.mediaItem()?.title || this.mediaItem()?.name,
          posterPath: this.mediaItem()?.backdrop_path || this.mediaItem()?.poster_path,
          trailerKey: result.trailer?.key || result?.videos?.results[0]?.key || null,
          mediaType: this.mediaType(),
          releaseDate: this.mediaItem()?.release_date
        } as TrailerItem);

        this.loadSimilarItems();
      }
    });
  }

  fetchMediaDetails(id: number, type: 'movie' | 'tv') {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const detailObs = type === 'movie'
      ? this.movieService.getMovieDetails(id)
      : this.movieService.getTvShowDetails(id);

    const creditsObs = type === 'movie'
      ? this.movieService.getMovieCredits(id)
      : this.movieService.getTvShowCredits(id);

    const videosObs = type === 'movie'
      ? this.movieService.getMovieVideos(id)
      : this.movieService.getTvShowVideos(id);

    return forkJoin({
      details: detailObs,
      credits: creditsObs,
      videos: videosObs
    }).pipe(
      map(data => {
        const officialTrailer = data.videos.results.find(
          v => v.site === 'YouTube' && v.type === 'Trailer' && v.official
        ) || data.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
        this.isLoading.set(false);
        return { ...data, trailer: officialTrailer || null };
      }),
      catchError(err => {
        this.errorMessage = err.message || `Failed to load ${type} details.`;
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  loadSimilarItems(): void {
    if (this.mediaId() && this.mediaType()) {
      const similarObs = this.movieService.getSimilarMedia(this.mediaType(), this.mediaId() as number);
      similarObs.pipe(takeUntil(this.destroy$))
        .subscribe(response => {
          this.similarItems.set(response.results);
        });
    }
  }


  /**
   * Constructs the URL for the backdrop image.
   * @returns A string containing the URL for the backdrop image, or 'none' if no backdrop path is available.
   */
  getBackdropImageUrl(): string {
    if (this.mediaItem()?.backdrop_path) {
      return `url(${this.movieService.getFullImageUrl(this.mediaItem()?.backdrop_path, 'w1280')})`;
    }
    return 'none';
  }

  getYear(dateString?: string): string | null {
    return dateString ? new Date(dateString).getFullYear().toString() : null;
  }

  getCreators(): CrewMember[] {
    return this.credits()?.crew.filter(c => c.job === 'Creator' || c.department === 'Writing') || [];
  }

  getDirectors(): CrewMember[] {
    return this.credits()?.crew.filter(c => c.job === 'Director') || [];
  }

  openTrailer(trailerItem: any): void {
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

  openHomepage(url: string | null | undefined): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}