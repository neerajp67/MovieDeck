import { Component, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { fromEvent, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TmdbApiService } from '../../services/api/tmdb-api.service';
import { CastMember } from '../../models/tmdb.model'; // Assuming CastMember interface is defined in a model file

@Component({
  selector: 'app-media-cast',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './media-cast.component.html',
  styleUrls: ['./media-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaCastComponent implements OnDestroy {
  cast = input.required<CastMember[]>();
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  placeholderImage: string = 'assets/images/placeholder_person.png';

  showArrows: boolean = false;
  canScrollLeft: boolean = false;
  canScrollRight: boolean = false;

  private isDragging = false;
  private startX = 0;
  private currentScrollLeftPosition = 0;
  private mouseMoveSubscription: Subscription | null = null;
  private mouseUpSubscription: Subscription | null = null;
  private destroy$ = new Subject<void>();

  constructor(public movieService: TmdbApiService, private cdr: ChangeDetectorRef) { }

  /**
   * Initializes drag-and-scroll on mouse down, capturing mouse events from the document.
   */
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

  /**
   * Handles the mouse movement for dragging.
   */
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.scrollContainer) return;
    event.preventDefault();
    const x = event.pageX - this.scrollContainer.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.scrollContainer.nativeElement.scrollLeft = this.currentScrollLeftPosition - walk;
    this.updateScrollArrowVisibility();
  }

  /**
   * Ends the drag-and-scroll on mouse up.
   */
  onMouseUp(): void {
    this.isDragging = false;
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.style.cursor = 'grab';
    }
    this.cancelDragSubscriptions();
  }

  /**
   * Ends the drag-and-scroll if the mouse leaves the container.
   */
  onMouseLeave(): void {
    this.isDragging = false;
    this.cancelDragSubscriptions();
  }

  /**
   * Cancels the active drag subscriptions to prevent memory leaks.
   */
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

  /**
   * Shows scroll arrows on mouse enter and updates their visibility.
   */
  onScrollWrapperMouseEnter(): void {
    this.showArrows = true;
    this.updateScrollArrowVisibility();
    this.cdr.detectChanges();
  }

  /**
   * Hides scroll arrows on mouse leave.
   */
  onScrollWrapperMouseLeave(): void {
    this.showArrows = false;
    this.cdr.detectChanges();
  }

  /**
   * Updates the visibility of the scroll arrows based on the scroll position.
   */
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

  /**
   * Scrolls the container to the left by a fixed amount.
   */
  scrollContentLeft(): void {
    if (this.scrollContainer) {
      const scrollAmount = this.scrollContainer.nativeElement.clientWidth * 0.7;
      this.scrollContainer.nativeElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  /**
   * Scrolls the container to the right by a fixed amount.
   */
  scrollContentRight(): void {
    if (this.scrollContainer) {
      const scrollAmount = this.scrollContainer.nativeElement.clientWidth * 0.7;
      this.scrollContainer.nativeElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  /**
 * Returns the correct image URL or a placeholder if the profile path is missing.
 */
  getProfileImageUrl(profilePath: string | null): string {
    return profilePath ? this.movieService.getFullImageUrl(profilePath, 'w185') : this.placeholderImage;
  }

  ngOnDestroy(): void {
    this.cancelDragSubscriptions();
    this.destroy$.next();
    this.destroy$.complete();
  }
}