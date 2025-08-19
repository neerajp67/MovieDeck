import { Component, Input, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Subject } from 'rxjs';
import { TmdbApiService } from '../../services/api/tmdb-api.service';
import { Movie, TvShow } from '../../models/tmdb.model';
import { HorizontalScrollComponent } from "../shared/horizontal-scroll/horizontal-scroll.component";

@Component({
  selector: 'app-media-similar',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTooltipModule, HorizontalScrollComponent],
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
    private readonly router: Router
  ) { }

  navigateToDetails(id: number): void {
    if (id) {
      this.router.navigate(['/', this.mediaType, id]);
    } else {
      console.error('Cannot navigate to detail: item id is missing.');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}