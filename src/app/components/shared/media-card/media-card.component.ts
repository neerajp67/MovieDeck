import { DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { TmdbApiService } from '../../../services/api/tmdb-api.service';
import { MediaCard } from '../../../models/tmdb.model';

@Component({
  selector: 'app-media-card',
  imports: [MatCardModule,
    DecimalPipe,
    DatePipe,
    NgIf
  ],
  templateUrl: './media-card.component.html',
  styleUrl: './media-card.component.scss'
})
export class MediaCardComponent {
  media = input.required<MediaCard>();

  router = inject(Router);
  movieService = inject(TmdbApiService);

  navigateToDetails() {
    if (this.media().id) {
      this.router.navigate(['/', this.media().media_type || 'movie', this.media().id]);
    } else {
      console.error('Cannot navigate to detail: item or item.id is missing', this.media().id);
    }
  }

}
