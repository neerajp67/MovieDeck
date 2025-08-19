import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, input, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, Subject, fromEvent } from 'rxjs';

@Component({
  selector: 'app-horizontal-scroll',
  imports: [MatIconModule,
    MatButtonModule,
    NgIf],
  templateUrl: './horizontal-scroll.component.html',
  styleUrl: './horizontal-scroll.component.scss'
})
export class HorizontalScrollComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  showArrows: boolean = false;
  canScrollLeft: boolean = false;
  canScrollRight: boolean = false;

  private isDragging = false;
  private startX = 0;
  private currentScrollLeftPosition = 0;

  private mouseMoveSubscription: Subscription | null = null;
  private mouseUpSubscription: Subscription | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly cdr: ChangeDetectorRef) { }

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
    if (!this?.scrollContainer?.nativeElement) {
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

  ngOnDestroy(): void {
    this.cancelDragSubscriptions();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
