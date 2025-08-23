import { inject, Injectable, signal } from '@angular/core';
import { Genre } from '../../models/tmdb.model';
import { TmdbApiService } from '../api/tmdb-api.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  moiveService = inject(TmdbApiService);

  private readonly _genres = signal<Genre[]>([]);
  public genres = this._genres.asReadonly();

  loadGenre() {
    if (this._genres().length === 0) { // Check if the subject already has data
      this.moiveService.getMovieGenre().subscribe({
        next: (response: any) => {
          this._genres.set(response.genres);
        },
        error: (error) => {
          console.error('Error loading genres:', error);
        }
      });
    }
  }
}
