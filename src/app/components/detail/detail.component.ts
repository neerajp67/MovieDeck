import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
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
  imports: [CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    MediaCastComponent, MediaSimilarComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy {
  mediaItem: Movie | TvShow | null = null;
  credits: CreditsResponse | null = null;
  mainTrailer: TrailerItem | null = null;
  trailerUrl: SafeResourceUrl | null = null;
  similarItems: (Movie | TvShow)[] = [];

  isLoading: boolean = true;
  errorMessage: string | null = null;
  mediaType: 'movie' | 'tv' = 'movie';
  mediaId: number | null = null;

  private destroy$ = new Subject<void>();


  constructor(
    private route: ActivatedRoute,
    public movieService: TmdbApiService,
    private trailerPlayerService: TrailerPlayerService
  ) { }

  ngOnInit(): void {
    this.route.data.pipe(
      switchMap(data => {
        this.mediaType = data['mediaType'] as 'movie' | 'tv';
        return this.route.paramMap;
      }),
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) {
          this.errorMessage = 'Invalid ID.';
          this.isLoading = false;
          return of(null);
        }
        this.mediaId = id;
        return this.fetchMediaDetails(id, this.mediaType);
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.mediaItem = result.details;
        this.credits = result.credits;
        this.mainTrailer = {
          id: this.mediaItem.id,
          title: this.mediaItem.title || this.mediaItem.name,
          posterPath: this.mediaItem.backdrop_path || this.mediaItem.poster_path,
          trailerKey: result.trailer?.key || null,
          mediaType: this.mediaType,
          releaseDate: this.mediaItem?.release_date
        } as TrailerItem;

        this.loadSimilarItems();
      }
    });
  }

  fetchMediaDetails(id: number, type: 'movie' | 'tv') {
    this.isLoading = true;
    this.errorMessage = null;

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
        this.isLoading = false;
        return { ...data, trailer: officialTrailer || null };
      }),
      catchError(err => {
        this.errorMessage = err.message || `Failed to load ${type} details.`;
        this.isLoading = false;
        return of(null);
      })
    );
  }

  loadSimilarItems(): void {
    if (this.mediaId && this.mediaType) {
      const similarObs = this.movieService.getSimilarMedia(this.mediaType, this.mediaId);
      similarObs.pipe(takeUntil(this.destroy$))
        .subscribe(response => {
          this.similarItems = response.results;
        });
    }
  }


  /**
   * Constructs the URL for the backdrop image.
   * @returns A string containing the URL for the backdrop image, or 'none' if no backdrop path is available.
   */
  getBackdropImageUrl(): string {
    if (this.mediaItem?.backdrop_path) {
      return `url(${this.movieService.getFullImageUrl(this.mediaItem.backdrop_path, 'w1280')})`;
    }
    return 'none';
  }

  getYear(dateString?: string): string | null {
    return dateString ? new Date(dateString).getFullYear().toString() : null;
  }

  getCreators(): CrewMember[] {
    return this.credits?.crew.filter(c => c.job === 'Creator' || c.department === 'Writing') || [];
  }

  getDirectors(): CrewMember[] {
    return this.credits?.crew.filter(c => c.job === 'Director') || [];
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

  openHomepage(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}