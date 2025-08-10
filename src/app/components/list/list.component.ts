import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Movie, TmdbResponse, Person, TvShow } from '../../models/tmdb.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { Subject, filter, takeUntil, Observable } from 'rxjs';
import { TmdbApiService } from '../../services/api/tmdb-api.service';

export type MediaType = 'movie' | 'tv' | 'person';
export type FilterType = 'bollywood' | 'hollywood';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonToggleModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  mediaItems: any = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  currentPage: number = 1;
  totalPages: number = 0;
  totalResults: number = 0;

  selectedMediaType: MediaType = 'movie';
  selectedFilter: FilterType = 'bollywood';

  private destroy$ = new Subject<void>();

  constructor(
    public movieService: TmdbApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Listen for route changes to update media type
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeFromRoute();
    });

    // Initial load
    this.initializeFromRoute();
  }

  initializeFromRoute(): void {
    const url = this.router.url;
    if (url.includes('/movies')) {
      this.selectedMediaType = 'movie';
    } else if (url.includes('/shows')) {
      this.selectedMediaType = 'tv';
    } else if (url.includes('/people')) {
      this.selectedMediaType = 'person';
    }

    this.loadMedia(this.currentPage);
  }

  selectFilter(type: FilterType): void {
    if (this.selectedFilter !== type) {
      this.selectedFilter = type;
      this.currentPage = 1;
      this.mediaItems = [];
      this.loadMedia(this.currentPage);
    }
  }

  loadMedia(page: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.currentPage = page;

    let serviceCall: Observable<TmdbResponse<Movie | Person | TvShow>>;

    serviceCall = this.movieService.getFilteredMedia(this.selectedMediaType, this.selectedFilter, this.currentPage);

    serviceCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TmdbResponse<Movie | Person | TvShow>) => {
          this.mediaItems = response.results;
          this.totalPages = response.total_pages;
          this.totalResults = response.total_results;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || `Failed to load ${this.selectedFilter} ${this.selectedMediaType}s.`;
          this.isLoading = false;
        }
      });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadMedia(page);
    }
  }

  navigateToDetails(item: Movie | Person | TvShow) {
    if (item?.id) {
      this.router.navigate(['/', this.selectedMediaType, item.id]);
    } else {
      console.error('Cannot navigate to detail: item or item.id is missing', item);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}