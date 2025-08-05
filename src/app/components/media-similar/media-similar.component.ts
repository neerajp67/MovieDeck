import { Component, Input, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { fromEvent, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TmdbApiService } from '../../services/api/tmdb-api.service';
import { Movie, TvShow } from '../../models/tmdb.model';

@Component({
  selector: 'app-media-similar',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './media-similar.component.html',
  styleUrls: ['./media-similar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaSimilarComponent implements OnDestroy {
  @Input() similarItems: (Movie | TvShow)[] = [];
  @Input() mediaType: 'movie' | 'tv' = 'movie'; // New input for mediaType to handle navigation

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

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
    public movieService: TmdbApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  onMouseDown(event: MouseEvent): void {
    if (!this.scrollContainer || event.button !== 0) return;
    this.isDragging = true;
    this.startX = event.pageX - this.scrollContainer.nativeElement.offsetLeft;
    this.currentScrollLeftPosition = this.scrollContainer.nativeElement.scrollLeft;
    this.cancelDragSubscriptions();
    this.mouseUpSubscription = fromEvent(document, 'mouseup').pipe(takeUntil(this.destroy$)).subscribe(() => this.onMouseUp());
    this.mouseMoveSubscription = fromEvent(document, 'mousemove').pipe(takeUntil(this.destroy$)).subscribe((e: Event) => this.onMouseMove(e as MouseEvent));
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

  onMouseLeave(): void {
    this.isDragging = false;
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
    if (!this?.scrollContainer?.nativeElement) {
      this.canScrollLeft = false;
      this.canScrollRight = false;
      this.cdr.detectChanges();
      return;
    }
    const element = this.scrollContainer.nativeElement;
    this.canScrollLeft = element.scrollLeft > 0;
    this.canScrollRight = Math.ceil(element.scrollLeft + element.clientWidth) < element.scrollWidth;
    this.cdr.detectChanges();
  }

  scrollContentLeft(): void {
    if (this.scrollContainer) {
      const scrollAmount = this.scrollContainer.nativeElement.clientWidth * 0.7;
      this.scrollContainer.nativeElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  scrollContentRight(): void {
    if (this.scrollContainer) {
      const scrollAmount = this.scrollContainer.nativeElement.clientWidth * 0.7;
      this.scrollContainer.nativeElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  navigateToDetails(id: number): void {
    if (id) {
      this.router.navigate(['/', this.mediaType, id]);
    } else {
      console.error('Cannot navigate to detail: item id is missing.');
    }
  }

  ngOnDestroy(): void {
    this.cancelDragSubscriptions();
    this.destroy$.next();
    this.destroy$.complete();
  }
}