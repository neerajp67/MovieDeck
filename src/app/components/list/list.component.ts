import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Movie, TmdbResponse } from '../../models/tmdb.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TmdbApiService } from '../../services/api/tmdb-api.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
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
  mediaItems: Movie[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  currentPage: number = 1;
  totalPages: number = 0;
  totalResults: number = 0;

  selectedMediaType: MediaType = 'movie';

  private destroy$ = new Subject<void>();

  constructor(public movieService: TmdbApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMedia(this.currentPage);
  }

  selectMediaType(type: MediaType): void {
    if (this.selectedMediaType !== type) {
      this.selectedMediaType = type;
      this.currentPage = 1;
      this.mediaItems = [];
      this.loadMedia(this.currentPage);
    }
  }

  loadMedia(page: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.currentPage = page;

    const serviceCall = this.selectedMediaType === 'movie'
      ? this.movieService.getPopularMovies(this.currentPage, 'IN')
      : this.movieService.getPopularTvShows(this.currentPage);

    serviceCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TmdbResponse<Movie>) => {
          this.mediaItems = response.results;
          this.totalPages = response.total_pages;
          this.totalResults = response.total_results;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || `Failed to load ${this.selectedMediaType}s.`;
          this.isLoading = false;
        }
      });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadMedia(page);
    }
  }

  navigateToDetails(item: number) {
    if (item) {
      this.router.navigate(['/', this.selectedMediaType, item]);
    } else {
      console.error('Cannot navigate to detail: item or item.id is missing', item);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


export type MediaType = 'movie' | 'tv';
