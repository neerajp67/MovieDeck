import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, Observable, switchMap, of, map, catchError, forkJoin, takeUntil, Subscription, fromEvent } from 'rxjs';
import { TmdbResponse, Movie } from '../../../models/tmdb.model';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-trailers',
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './trailers.component.html',
  styleUrl: './trailers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrailersComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  trailers: TrailerItem[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  selectedCategory: TrailerCategory = 'movie';

  showArrows: boolean = false;
  canScrollLeft: boolean = false;
  canScrollRight: boolean = false;

  private isDragging = false;
  private startX = 0;
  private currentScrollLeftPosition = 0;

  private mouseMoveSubscription: Subscription | null = null;
  private mouseUpSubscription: Subscription | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private movieService: TmdbApiService,
    private cdr: ChangeDetectorRef
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
                releaseDate: item?.release_date
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
          this.updateScrollArrowVisibility();
          if (this.trailers.length > 3) {
            this.canScrollRight = true;
          } else {
            this.canScrollRight = false;
          }
          this.canScrollLeft = false;
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

  onMouseDown(event: MouseEvent): void {
    if (!this.scrollContainer || event.button !== 0) return;

    this.isDragging = true;
    this.startX = event.pageX - this.scrollContainer.nativeElement.offsetLeft;
    this.currentScrollLeftPosition = this.scrollContainer.nativeElement.scrollLeft;

    this.cancelDragSubscriptions();

    this.mouseUpSubscription = fromEvent(document, 'mouseup').subscribe(() => this.onMouseUp());
    this.mouseMoveSubscription = fromEvent(document, 'mousemove').subscribe((e: Event) => this.onMouseMove(e as MouseEvent));

    event.preventDefault();
    this.scrollContainer.nativeElement.style.cursor = 'grabbing';
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.scrollContainer) return;

    event.preventDefault();
    const x = event.pageX - this.scrollContainer.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.scrollContainer.nativeElement.scrollLeft = this.currentScrollLeftPosition - walk;
    this.updateScrollArrowVisibility();
  }

  onMouseUp(): void {
    this.isDragging = false;
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.style.cursor = 'grab';
    }
    this.cancelDragSubscriptions();
  }

  private cancelDragSubscriptions(): void {
    if (this.mouseUpSubscription) {
      this.mouseUpSubscription.unsubscribe();
      this.mouseUpSubscription = null;
    }
    if (this.mouseMoveSubscription) {
      this.mouseMoveSubscription.unsubscribe();
      this.mouseMoveSubscription = null;
    }
  }

  onScrollWrapperMouseEnter(): void {
    this.showArrows = true;
    this.updateScrollArrowVisibility();
    this.cdr.detectChanges();
  }

  onScrollWrapperMouseLeave(): void {
    this.showArrows = false;
    this.cdr.detectChanges();
  }

  onScroll(): void {
    this.updateScrollArrowVisibility();
  }

  private updateScrollArrowVisibility(): void {
    if (!this.scrollContainer?.nativeElement) {
      this.canScrollLeft = false;
      this.canScrollRight = false;
      this.cdr.detectChanges();
      return;
    }

    const element = this.scrollContainer.nativeElement;
    const scrollLeft = element.scrollLeft;
    const scrollWidth = element.scrollWidth;
    const clientWidth = element.clientWidth;

    this.canScrollLeft = scrollLeft > 0;
    this.canScrollRight = Math.ceil(scrollLeft + clientWidth) < scrollWidth;
    this.cdr.detectChanges();
  }

  scrollContentLeft(): void {
    if (this.scrollContainer) {
      const scrollAmount = this.scrollContainer.nativeElement.clientWidth * 0.7;
      this.scrollContainer.nativeElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(() => this.updateScrollArrowVisibility(), 600);
    }
  }

  scrollRight(): void {
    if (this.scrollContainer) {
      const scrollAmount = this.scrollContainer.nativeElement.clientWidth * 0.7;
      this.scrollContainer.nativeElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(() => this.updateScrollArrowVisibility(), 600);
    }
  }

  getYouTubeThumbnail(key: string | null): string {
    return key ? `https://img.youtube.com/vi/${key}/mqdefault.jpg` : 'https://via.placeholder.com/320x180.png?text=No+Trailer';
  }

  openTrailer(key: string | null): void {
    if (key) {
      window.open(`https://www.youtube.com/watch?v=${key}`, '_blank');
    }
  }

  ngOnDestroy(): void {
    this.cancelDragSubscriptions();
    this.destroy$.next();
    this.destroy$.complete();
  }
}

export type TrailerCategory = 'movie' | 'tv' | 'upcomming';

interface TrailerItem {
  id: number;
  title: string;
  posterPath: string | null;
  trailerKey: string | null;
  mediaType: TrailerCategory;
  releaseDate?: string;
}