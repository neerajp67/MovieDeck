import { ChangeDetectorRef, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { StoreService } from '../../../services/utils/store.service';
import { interval, Subject, Subscription, takeUntil } from 'rxjs';
import { Movie } from '../../../models/tmdb.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [
    MatButtonModule,
    MatIconModule,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, OnDestroy {
  storeService = inject(StoreService);
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  movieService = inject(TmdbApiService)

  private readonly destroy$ = new Subject<void>(); // For unsubscribing on destroy
  private slideshowSubscription: Subscription | null = null;

  movies = signal<Movie[]>([]);
  genres = computed(() => this.storeService.genres())
  currentMovie = signal<Movie | null>(null);

  currentSlideIndex = signal<number>(0);
  isImageFading = signal<boolean>(false);
  private imageLoadTimeout: any;

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies() {
    this.movieService.getTrendingMovies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.movies.set(response?.results.slice(0, 8));
          if (this.movies().length > 0) {
            this.currentMovie.set(this.movies()[0]);
            this.currentSlideIndex.set(0);
            this.isImageFading.set(true);
            this.cdr.detectChanges();
            setTimeout(() => {
              this.startSlideshowTimer(5000); // Start the slideshow with a 5-second interval
              this.cdr.detectChanges();
            }, 3000);
          } else {
            console.warn('No movies available for hero section after filtering.');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log('Error while fetching movies: ', error);
        }
      })

  }

  getGenreName(id: number): string {
    const genre = this.genres()?.find(g => g.id === id);
    return genre ? genre?.name : 'Unknown';
  }

  /**
    * Starts the automatic slideshow timer.
    * @param delay The delay in milliseconds before the next slide.
    */
  private startSlideshowTimer(delay: number): void {
    this.stopSlideshow();
    this.slideshowSubscription = interval(delay).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.nextSlide();
      this.cdr.detectChanges();
    });
  }

  /**
   * Stops the automatic slideshow timer.
   */
  private stopSlideshow(): void {
    if (this.slideshowSubscription) {
      this.slideshowSubscription.unsubscribe();
      this.slideshowSubscription = null;
    }
  }

  nextSlide(): void {
    const nextIndex = (this.currentSlideIndex() + 1) % this.movies().length;
    this.updateMovieAndStartFade(nextIndex);
  }

  prevSlide(): void {
    const prevIndex = (this.currentSlideIndex() - 1 + this.movies().length) % this.movies().length;
    this.updateMovieAndStartFade(prevIndex);
  }

  selectSlide(index: number): void {
    if (this.currentSlideIndex() === index) return;
    this.updateMovieAndStartFade(index);
  }

  /**
   * Updates the current movie and handles the fade transition.
   * @param newIndex The index of the next movie.
   */
  private updateMovieAndStartFade(newIndex: number): void {
    this.stopSlideshow();

    this.isImageFading.set(false); // Start fade-out (opacity 0 from CSS)
    this.cdr.detectChanges(); // Immediately apply opacity 0

    // Small timeout to allow opacity 0 to apply, then change src and start fade-in
    this.imageLoadTimeout = setTimeout(() => {
      this.currentSlideIndex.set(newIndex);
      this.currentMovie.set(this.movies()[this.currentSlideIndex()]);
      this.isImageFading.set(true); // Trigger fade-in (opacity 1 from CSS)
      this.cdr.detectChanges();

      // Restart the slideshow timer after the new image has fully faded in (or close to it)
      // The CSS transition is 1s, so 1.1s is a good delay before restarting timer
      setTimeout(() => {
        this.startSlideshowTimer(3000);
      }, 1100);
    }, 100);
  }

  viewDetails(id: any) {
    this.router.navigate(['movie', id])
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
    if (this.imageLoadTimeout) {
      clearTimeout(this.imageLoadTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}