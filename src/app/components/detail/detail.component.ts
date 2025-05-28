import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'; // Import pipes
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips'; // For genres

import { Subject, forkJoin, of } from 'rxjs';
import { switchMap, takeUntil, catchError, map } from 'rxjs/operators';
import { Movie, TvShow, CreditsResponse, Video, CrewMember } from '../../models/tmdb.model';
import { TmdbApiService } from '../../services/api/tmdb-api.service'; import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-detail',
  imports: [CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    DatePipe, // Make pipes available if not globally
    DecimalPipe],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit, OnDestroy {
  mediaItem: Movie | TvShow | null = null;
  credits: CreditsResponse | null = null;
  mainTrailer: Video | null = null;
  trailerUrl: SafeResourceUrl | null = null;

  isLoading: boolean = true;
  errorMessage: string | null = null;
  mediaType: 'movie' | 'tv' = 'movie';

  private destroy$ = new Subject<void>();


  constructor(
    private route: ActivatedRoute,
    public movieService: TmdbApiService,
    private sanitizer: DomSanitizer
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
        return this.fetchMediaDetails(id, this.mediaType);
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.mediaItem = result.details;
        this.credits = result.credits;
        this.mainTrailer = result.trailer;
        if (this.mainTrailer?.key) {
          this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${this.mainTrailer.key}`);
        }
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

  getYear(dateString?: string): string | null {
    return dateString ? new Date(dateString).getFullYear().toString() : null;
  }

  getCreators(): CrewMember[] {
    return this.credits?.crew.filter(c => c.job === 'Creator' || c.department === 'Writing') || [];
  }

  getDirectors(): CrewMember[] {
    return this.credits?.crew.filter(c => c.job === 'Director') || [];
  }

  openTrailerModal(): void {
    if (this.mainTrailer?.key) {
      window.open(`https://www.youtube.com/watch?v=${this.mainTrailer.key}`, '_blank');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
