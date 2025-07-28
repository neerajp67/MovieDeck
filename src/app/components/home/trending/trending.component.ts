import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil, fromEvent, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { Movie, TmdbResponse } from '../../../models/tmdb.model';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trending',
  imports: [CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonToggleModule
  ],
  templateUrl: './trending.component.html',
  styleUrl: './trending.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendingComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  trendingMovies: Movie[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  activeTimeWindow: TimeWindow = 'day';

  showArrows: boolean = false;
  canScrollLeft: boolean = false;
  canScrollRight: boolean = false;

  private isDragging = false;
  private startX = 0;
  private currentScrollLeftPosition = 0;

  private mouseMoveSubscription: Subscription | null = null;
  private mouseUpSubscription: Subscription | null = null;

  private destroy$ = new Subject<void>();

  constructor(public movieService: TmdbApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTrendingMovies();
  }

  loadTrendingMovies(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.movieService.getTrendingMovies(this.activeTimeWindow)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TmdbResponse) => {
          this.trendingMovies = response.results;
          this.isLoading = false;
          // Using requestAnimationFrame for more reliable DOM layout measurement
          requestAnimationFrame(() => {
            this.updateScrollArrowVisibility();
            // Ensure right arrow is initially visible if there are movies
            if (this.trendingMovies.length > 0 && this.scrollContainer && this.scrollContainer.nativeElement.scrollWidth > this.scrollContainer.nativeElement.clientWidth) {
              this.canScrollRight = true; // Force right arrow to be true if content is wider
            } else {
              this.canScrollRight = false; // Otherwise, if content fits, it's false
            }
            this.canScrollLeft = false; // Always hide left arrow initially

            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load trending movies.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
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
    this.updateScrollArrowVisibility(); // Recalculate visibility on hover
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
    if (!this?.scrollContainer.nativeElement) {
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

  navigateToDetails(item: number) {
    if (item) {
      this.router.navigate(['/', 'movie', item]);
    } else {
      console.error('Cannot navigate to detail: item or item.id is missing', item);
    }
  }

  ngOnDestroy(): void {
    this.cancelDragSubscriptions();
    this.destroy$.next();
    this.destroy$.complete();
  }
}

export type TimeWindow = 'day' | 'week';