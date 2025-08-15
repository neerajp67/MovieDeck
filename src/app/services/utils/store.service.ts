import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Genre } from '../../models/tmdb.model';
import { TmdbApiService } from '../api/tmdb-api.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private moiveService: TmdbApiService) { }

  private _genresSubject = new BehaviorSubject<Genre[]>([]);
  genres$: Observable<Genre[]> = this._genresSubject.asObservable();

  loadGenre() {
    if (this._genresSubject.getValue().length === 0) { // Check if the subject already has data
      this.moiveService.getMovieGenre().subscribe({
        next: (response: any) => { 
          this._genresSubject.next(response.genres);
        },
        error: (error) => {
          console.error('Error loading genres:', error);
        }
      });
    }
  }

  getGenres(): Observable<Genre[]> {
    return this.genres$;
  }
}
