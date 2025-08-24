import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, Subject, fromEvent } from 'rxjs';

@Component({
  selector: 'app-horizontal-scroll',
  imports: [MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './horizontal-scroll.component.html',
  styleUrl: './horizontal-scroll.component.scss'
})
export class HorizontalScrollComponent {
  scrollContainer = viewChild.required<ElementRef<HTMLDivElement>>('scrollContainer');

  showArrows = signal<boolean>(false);
  canScrollLeft = signal<boolean>(false);
  canScrollRight = signal<boolean>(false);

  private isDragging = signal<boolean>(false);
  private startX = signal<number>(0);
  private currentScrollLeftPosition = signal<number>(0);

  private mouseMoveSubscription: Subscription | null = null;
  private mouseUpSubscription: Subscription | null = null;

  onMouseDown(event: MouseEvent): void {
    if (!this.scrollContainer() || event.button !== 0) return;

    this.isDragging.set(true);
    this.startX.set(event.pageX - this.scrollContainer().nativeElement.offsetLeft);
    this.currentScrollLeftPosition.set(this.scrollContainer().nativeElement.scrollLeft);

    this.cancelDragSubscriptions();

    this.mouseUpSubscription = fromEvent(document, 'mouseup').subscribe(() => this.onMouseUp());
    this.mouseMoveSubscription = fromEvent(document, 'mousemove').subscribe((e: Event) => this.onMouseMove(e as MouseEvent));

    event.preventDefault();
    this.scrollContainer().nativeElement.style.cursor = 'grabbing';
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.scrollContainer()) return;

    event.preventDefault();
    const x = event.pageX - this.scrollContainer().nativeElement.offsetLeft;
    const walk = (x - this.startX()) * 1.5;
    this.scrollContainer().nativeElement.scrollLeft = this.currentScrollLeftPosition() - walk;
    this.updateScrollArrowVisibility();
  }

  onMouseUp(): void {
    this.isDragging.set(false);
    if (this.scrollContainer()) {
      this.scrollContainer().nativeElement.style.cursor = 'grab';
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
    this.showArrows.set(true);
    this.updateScrollArrowVisibility(); // Recalculate visibility on hover
  }

  onScrollWrapperMouseLeave(): void {
    this.showArrows.set(false);
  }

  onScroll(): void {
    this.updateScrollArrowVisibility();
  }

  private updateScrollArrowVisibility(): void {
    if (!this?.scrollContainer()?.nativeElement) {
      this.canScrollLeft.set(false);
      this.canScrollRight.set(false);
      return;
    }

    const element = this.scrollContainer().nativeElement;
    const scrollLeft = element.scrollLeft;
    const scrollWidth = element.scrollWidth;
    const clientWidth = element.clientWidth;

    this.canScrollLeft.set(scrollLeft > 0);
    this.canScrollRight.set(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  }

  scrollContentLeft(): void {
    if (this.scrollContainer()) {
      const scrollAmount = this.scrollContainer().nativeElement.clientWidth * 0.7;
      this.scrollContainer().nativeElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(() => this.updateScrollArrowVisibility(), 600);
    }
  }

  scrollRight(): void {
    if (this.scrollContainer()) {
      const scrollAmount = this.scrollContainer().nativeElement.clientWidth * 0.7;
      this.scrollContainer().nativeElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(() => this.updateScrollArrowVisibility(), 600);
    }
  }

  ngOnDestroy(): void {
    this.cancelDragSubscriptions();
  }
}
