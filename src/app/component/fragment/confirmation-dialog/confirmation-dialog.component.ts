import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData,
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {}

  ngOnInit() {
  }

  onNoButtonClick(): void {
    this.dialogRef.close({result: false});
  }

  onYesButtonClick(): void {
    this.dialogRef.close({result: true});
  }
}

export interface ConfirmationDialogData {
  title: string;
  content: string;
}
