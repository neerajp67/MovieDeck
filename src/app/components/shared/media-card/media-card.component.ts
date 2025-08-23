import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { MediaCard } from '../../../models/tmdb.model';

@Component({
  selector: 'app-media-card',
  imports: [MatCardModule,
    DecimalPipe,
    DatePipe,
  ],
  templateUrl: './media-card.component.html',
  styleUrl: './media-card.component.scss'
})
export class MediaCardComponent {
  media = input.required<MediaCard>();

  router = inject(Router);
  movieService = inject(TmdbApiService);

  placeholderImage = signal<string>('assets/images/placeholder_person.png');


  navigateToDetails() {
    if (this.media().id && this.media().media_type !== 'person') {
      this.router.navigate(['/', this.media().media_type || 'movie', this.media().id]);
    } else {
      console.error('Cannot navigate to detail: item or item.id is missing', this.media().id);
    }
  }


  getProfileImageUrl(): string {
    if (this.media().media_type === 'person' && !this.media().poster_path) return this.placeholderImage();

    return this.movieService.getFullImageUrl(this.media().poster_path, 'w300')
  }
}