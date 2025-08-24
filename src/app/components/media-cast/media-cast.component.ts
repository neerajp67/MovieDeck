import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TmdbApiService } from '../../services/api/tmdb-api.service';
import { CastMember, MediaCard } from '../../models/tmdb.model';
import { HorizontalScrollComponent } from '../shared/horizontal-scroll/horizontal-scroll.component';
import { MediaCardComponent } from "../shared/media-card/media-card.component";

@Component({
  selector: 'app-media-cast',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    HorizontalScrollComponent,
    MediaCardComponent
  ],
  templateUrl: './media-cast.component.html',
  styleUrls: ['./media-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaCastComponent {
  movieService = inject(TmdbApiService);
  cast = input.required<CastMember[]>();
  placeholderImage = signal<string>('assets/images/placeholder_person.png');

  /**
 * Returns the correct image URL or a placeholder if the profile path is missing.
 */
  getProfileImageUrl(profilePath: string | null): string {
    return profilePath ? this.movieService.getFullImageUrl(profilePath, 'w185') : this.placeholderImage();
  }

  getMedia(member: any): MediaCard {
    return {
      id: member.id,
      title: member.name,
      subtitle: {
        poster_path: member.profile_path,
        known_for_department: member.character
      },
      media_type: 'person'
    };
  }
}