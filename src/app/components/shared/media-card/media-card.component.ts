import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { MediaCard } from '../../../models/tmdb.model';
import { MatIconModule } from '@angular/material/icon';
import { TrailerPlayerService } from '../../../services/utils/trailer-player.service';

@Component({
  selector: 'app-media-card',
  imports: [MatCardModule,
    MatIconModule,
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
  trailerPlayerService = inject(TrailerPlayerService);

  placeholderImage = signal<string>('assets/images/placeholder_person.png');


  navigateToDetails() {
    if (this.media().media_type === 'person') return;

    if (this.media().trailer) {
      this.openTrailer(this.media());
    } else if (this.media().id) {
      this.router.navigate(['/', this.media().media_type || 'movie', this.media().id]);
    } else {
      console.error('Cannot navigate to detail: item or item.id is missing', this.media().id);
    }
  }


  openTrailer(media: MediaCard): void {
    if (media.trailer?.trailer_key) {
      this.trailerPlayerService.openTrailerModal({
        title: media.title,
        posterPath: media.subtitle.poster_path || null,
        trailerKey: media.trailer.trailer_key,
      });
    } else {
      console.warn('No trailer key available for this item (should have been filtered out):', media.title);
    }
  }


  getProfileImageUrl(): string {
    if (this.media().media_type === 'person' && !this.media().subtitle.poster_path) return this.placeholderImage();

    return this.movieService.getFullImageUrl(this.media().subtitle.poster_path, 'w300')
  }
}