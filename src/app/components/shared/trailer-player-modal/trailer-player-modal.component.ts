import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface TrailerModalData {
  title: string;
  trailerKey: string | null;
  posterPath: string | null;
  isLoading?: boolean;
  errorMessage?: string | null;
}

@Component({
  selector: 'app-trailer-player-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './trailer-player-modal.component.html',
  styleUrls: ['./trailer-player-modal.component.scss']
})
export class TrailerPlayerModalComponent implements OnInit {
  videoUrl: SafeResourceUrl | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TrailerModalData,
    public dialogRef: MatDialogRef<TrailerPlayerModalComponent>,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.data.trailerKey) {
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${this.data.trailerKey}?autoplay=0&controls=1&showinfo=0&rel=0&modestbranding=1`
      );
      this.data.isLoading = false;
      this.data.errorMessage = null;
    } else {
      this.data.isLoading = false;
      this.data.errorMessage = 'No trailer key provided for playback.';
      this.videoUrl = null;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}