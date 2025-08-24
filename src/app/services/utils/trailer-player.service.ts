import { inject, Injectable, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TrailerPlayerModalComponent, TrailerModalData } from '../../components/shared/trailer-player-modal/trailer-player-modal.component';

@Injectable({
  providedIn: 'root'
})
export class TrailerPlayerService {
  // private dialogRef: MatDialogRef<TrailerPlayerModalComponent> | null = null;

  private readonly dialogRef = signal<MatDialogRef<TrailerPlayerModalComponent> | null>(null);

  private readonly dialog = inject(MatDialog);

  /**
   * Opens the trailer playback modal.
   * @param data Initial data for the modal.
   * @returns A reference to the opened dialog.
   */
  openTrailerModal(data: TrailerModalData): MatDialogRef<TrailerPlayerModalComponent> | null {
    if (this.dialogRef()) {
      this.dialogRef()?.close();
    }

    this.dialogRef.set(this.dialog.open(TrailerPlayerModalComponent, {
      data: data,
      width: '80vw',
      maxWidth: '900px',
      height: 'auto',
      panelClass: 'trailer-player-dialog-panel',
      backdropClass: 'trailer-player-backdrop',
      disableClose: false
    }));

    this.dialogRef()?.afterClosed().subscribe(() => {
      this.dialogRef.set(null);
    });

    return this.dialogRef();
  }

  /**
   * Closes the currently open trailer modal.
   */
  closeTrailerModal(): void {
    if (this.dialogRef()) {
      this.dialogRef()?.close();
      this.dialogRef.set(null);
    }
  }
}