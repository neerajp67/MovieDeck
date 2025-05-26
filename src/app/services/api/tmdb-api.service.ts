// src/app/services/tmdb.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, TmdbResponse } from '../../models/tmdb.model';

@Injectable({
  providedIn: 'root'
})
export class TmdbApiService {
  private apiUrl = environment.apiUrl;
  public imageBaseUrl = environment.imageBaseUrl;

  constructor(private http: HttpClient) { }

  getFullImageUrl(path: string | null, size: string = 'w500'): string | null {
    if (!path) {
      return 'https://via.placeholder.com/500x750.png?text=No+Image';
    }
    return `${this.imageBaseUrl}${size}${path}`;
  }

  getPopularMovies(page: number = 1, language: string = 'en-US', region: string = 'IN'): Observable<TmdbResponse<Movie>> {
    const params = new HttpParams()
      .set('language', language)
      .set('page', page.toString())
      .set('region', region)
      .set('sort_by', 'popularity.desc')
      .set('watch_region', region)
      .set('with_origin_country', region);

    return this.http.get<TmdbResponse<Movie>>(`${this.apiUrl}/discover/movie`, { params });
  }
  getPopularTvShows(page: number = 1, language: string = 'en-US'): Observable<TmdbResponse<Movie>> {
    const params = new HttpParams()
      .set('language', language)
      .set('page', page.toString())
      .set('sort_by', 'popularity.desc')

    return this.http.get<TmdbResponse<Movie>>(`${this.apiUrl}/discover/tv`, { params });
  }
  getTrendingMovies(timeWindow: 'day' | 'week' = 'week', language: string = 'en-US'): Observable<TmdbResponse> {
    const params = new HttpParams()
      .set('language', language);

    const trendingMoviesUrl = `${this.apiUrl}/trending/movie/${timeWindow}`;
    return this.http.get<TmdbResponse>(trendingMoviesUrl, { params });
  }
}