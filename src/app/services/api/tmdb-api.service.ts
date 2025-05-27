// src/app/services/tmdb.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, TmdbResponse, VideoResponse } from '../../models/tmdb.model';

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
  getMovieVideos(movieId: number): Observable<VideoResponse> {
    const videosUrl = `${this.apiUrl}/movie/${movieId}/videos`;
    return this.http.get<VideoResponse>(videosUrl);
  }

  getTvShowVideos(tvShowId: number): Observable<VideoResponse> {
    const videosUrl = `${this.apiUrl}/tv/${tvShowId}/videos`;
    return this.http.get<VideoResponse>(videosUrl);
  }

  getUpcommingVideos(movieId: number): Observable<VideoResponse> {
    const videosUrl = `${this.apiUrl}/movie/${movieId}/videos`;
    return this.http.get<VideoResponse>(videosUrl);
  }

  getNowPlayingMovies(page: number = 1, region: string = 'IN'): Observable<TmdbResponse<Movie>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('language', 'en-US');
    if (region) {
      params = params.set('region', region);
    }
    const url = `${this.apiUrl}/movie/now_playing`;
    return this.http.get<TmdbResponse<Movie>>(url, { params })
  }

  getAiringTodayTvShows(page: number = 1): Observable<TmdbResponse<Movie>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('language', 'en-US');
    const url = `${this.apiUrl}/tv/airing_today`;
    return this.http.get<TmdbResponse<Movie>>(url, { params });
  }

  getUpcomming(page: number = 1): Observable<TmdbResponse<Movie>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('language', 'en-US');
    const url = `${this.apiUrl}/movie/upcoming`;
    return this.http.get<TmdbResponse<Movie>>(url, { params });
  }
}