import { Component, Input, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Subject } from 'rxjs';
import { TmdbApiService } from '../../services/api/tmdb-api.service';
import { MediaCard, Movie, TvShow } from '../../models/tmdb.model';
import { HorizontalScrollComponent } from "../shared/horizontal-scroll/horizontal-scroll.component";
import { MediaCardComponent } from "../shared/media-card/media-card.component";

@Component({
  selector: 'app-media-similar',
  standalone: true,
  imports: [CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    HorizontalScrollComponent,
    MediaCardComponent],
  templateUrl: './media-similar.component.html',
  styleUrls: ['./media-similar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaSimilarComponent implements OnDestroy {
  @Input() similarItems: (Movie | TvShow)[] = [];
  @Input() mediaType: 'movie' | 'tv' = 'movie'; // New input for mediaType to handle navigation

  private readonly destroy$ = new Subject<void>();

  constructor(
    public movieService: TmdbApiService,
  ) { }

  getMedia(media: Movie): MediaCard {
    return {
      id: media.id,
      title: media.title || media.name,
      poster_path: media.poster_path,
      release_date: media.release_date || media.first_air_date,
      vote_average: media.vote_average,
      media_type: this.mediaType
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}