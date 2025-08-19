import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { TmdbApiService } from '../../services/api/tmdb-api.service';
import { CastMember } from '../../models/tmdb.model'; // Assuming CastMember interface is defined in a model file
import { HorizontalScrollComponent } from '../shared/horizontal-scroll/horizontal-scroll.component';

@Component({
  selector: 'app-media-cast',
  standalone: true,
  imports: [CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    HorizontalScrollComponent],
  templateUrl: './media-cast.component.html',
  styleUrls: ['./media-cast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaCastComponent implements OnDestroy {
  cast = input.required<CastMember[]>();
  placeholderImage: string = 'assets/images/placeholder_person.png';

  private readonly destroy$ = new Subject<void>();

  constructor(public movieService: TmdbApiService, private readonly cdr: ChangeDetectorRef) { }

  /**
 * Returns the correct image URL or a placeholder if the profile path is missing.
 */
  getProfileImageUrl(profilePath: string | null): string {
    return profilePath ? this.movieService.getFullImageUrl(profilePath, 'w185') : this.placeholderImage;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}