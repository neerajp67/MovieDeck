import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { StoreService } from '../../../services/utils/store.service';
import { interval, Subject, Subscription, takeUntil } from 'rxjs';
import { Genre, Movie } from '../../../models/tmdb.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hero',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // For unsubscribing on destroy
  private slideshowSubscription: Subscription | null = null;

  movies: Movie[] = [];
  genres: Genre[] = [];
  currentMovie: Movie | null = null;

  currentSlideIndex: number = 0;
  isImageFading: boolean = false;
  private imageLoadTimeout: any;

  movieService = inject(TmdbApiService)
  constructor(private storeService: StoreService, private cdr: ChangeDetectorRef) {

  }
  ngOnInit(): void {
    this.storeService.getGenres()
      .pipe(takeUntil(this.destroy$))
      .subscribe(genres => {
        this.genres = genres;
        console.log(this.genres);
      });

    this.loadMovies();

  }

  loadMovies() {
    this.movieService.getTrendingMovies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.movies = response?.results.slice(0, 8);
          if (this.movies.length > 0) {
            this.currentMovie = this.movies[0];
            this.currentSlideIndex = 0;
            this.isImageFading = true;
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
    const genre = this.genres?.find(g => g.id === id);
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
    const nextIndex = (this.currentSlideIndex + 1) % this.movies.length;
    this.updateMovieAndStartFade(nextIndex);
  }

  prevSlide(): void {
    const prevIndex = (this.currentSlideIndex - 1 + this.movies.length) % this.movies.length;
    this.updateMovieAndStartFade(prevIndex);
  }

  selectSlide(index: number): void {
    if (this.currentSlideIndex === index) return;
    this.updateMovieAndStartFade(index);
  }

  /**
   * Updates the current movie and handles the fade transition.
   * @param newIndex The index of the next movie.
   */
  private updateMovieAndStartFade(newIndex: number): void {
    this.stopSlideshow();

    this.isImageFading = false; // Start fade-out (opacity 0 from CSS)
    this.cdr.detectChanges(); // Immediately apply opacity 0

    // Small timeout to allow opacity 0 to apply, then change src and start fade-in
    this.imageLoadTimeout = setTimeout(() => {
      this.currentSlideIndex = newIndex;
      this.currentMovie = this.movies[this.currentSlideIndex];
      this.isImageFading = true; // Trigger fade-in (opacity 1 from CSS)
      this.cdr.detectChanges();

      // Restart the slideshow timer after the new image has fully faded in (or close to it)
      // The CSS transition is 1s, so 1.1s is a good delay before restarting timer
      setTimeout(() => {
        this.startSlideshowTimer(3000);
      }, 1100);
    }, 100);
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