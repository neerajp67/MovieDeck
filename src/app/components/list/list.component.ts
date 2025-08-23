import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Movie, TmdbResponse, Person, TvShow, MediaCard, PopularCategory } from '../../models/tmdb.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { Subject, filter, takeUntil, Observable } from 'rxjs';
import { TmdbApiService } from '../../services/api/tmdb-api.service';
import { MediaCardComponent } from "../shared/media-card/media-card.component";

export type MediaType = 'movie' | 'tv' | 'person';
export type FilterType = 'bollywood' | 'hollywood';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonToggleModule,
    MediaCardComponent
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  movieService = inject(TmdbApiService);
  router = inject(Router);

  mediaItems = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  totalResults = signal<number>(0);

  selectedMediaType = signal<MediaType>('movie');
  selectedFilter = signal<FilterType>('bollywood');
  placeholderImage = signal<string>('assets/images/placeholder_person.png');

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeFromRoute();
    });

    this.initializeFromRoute();
  }

  initializeFromRoute(): void {
    const url = this.router.url;
    if (url.includes('/movies')) {
      this.selectedMediaType.set('movie');
    } else if (url.includes('/shows')) {
      this.selectedMediaType.set('tv');
    } else if (url.includes('/people')) {
      this.selectedMediaType.set('person');
    }

    this.loadMedia(this.currentPage());
  }

  selectFilter(type: FilterType): void {
    if (this.selectedFilter() !== type) {
      this.selectedFilter.set(type);
      this.currentPage.set(1);
      this.mediaItems.set([]);
      this.loadMedia(this.currentPage());
    }
  }

  loadMedia(page: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.currentPage.set(page);

    let serviceCall: Observable<TmdbResponse<Movie | Person | TvShow>>;

    serviceCall = this.movieService.getFilteredMedia(this.selectedMediaType(), this.selectedFilter(), this.currentPage());

    serviceCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TmdbResponse<Movie | Person | TvShow>) => {
          this.mediaItems.set(response.results);
          this.totalPages.set(response.total_pages);
          this.totalResults.set(response.total_results);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.message || `Failed to load ${this.selectedFilter} ${this.selectedMediaType}s.`);
          this.isLoading.set(false);
        }
      });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.loadMedia(page);
    }
  }

  getProfileImageUrl(item: any): string {
    if (this.selectedMediaType() === 'person' && !item?.profile_path) return this.placeholderImage();

    return this.movieService.getFullImageUrl(this.selectedMediaType() === 'person' ? item?.profile_path : item?.poster_path, 'w300')
  }

  getMedia(media: Movie): MediaCard {
    return {
      id: media.id,
      title: media.title || media.name,
      poster_path: media.poster_path,
      release_date: media.release_date || media.first_air_date,
      vote_average: media.vote_average,
      media_type: this.selectedMediaType() as PopularCategory
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}