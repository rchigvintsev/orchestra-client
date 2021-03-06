import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {By} from '@angular/platform-browser';

import {ConfirmationDialogComponent} from './confirmation-dialog.component';
import {TestSupport} from '../../../test/test-support';

class MatDialogRefMock {
  // noinspection JSUnusedGlobalSymbols
  close() {
  }
}

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: TestSupport.IMPORTS,
      declarations: TestSupport.DECLARATIONS,
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: MatDialogRef, useClass: MatDialogRefMock},
        {provide: MAT_DIALOG_DATA, useValue: []}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true when "Yes" button was clicked', async () => {
    const matDialogRef = fixture.debugElement.injector.get(MatDialogRef);
    spyOn(matDialogRef, 'close');
    const yesButton = fixture.debugElement.query(By.css('#yes_button'));
    await fixture.whenStable();
    yesButton.nativeElement.click();
    fixture.detectChanges();
    expect(matDialogRef.close).toHaveBeenCalledWith({result: true});
  });

  it('should return false when "No" button was clicked', async () => {
    const matDialogRef = fixture.debugElement.injector.get(MatDialogRef);
    spyOn(matDialogRef, 'close');
    const noButton = fixture.debugElement.query(By.css('#no_button'));
    await fixture.whenStable();
    noButton.nativeElement.click();
    fixture.detectChanges();
    expect(matDialogRef.close).toHaveBeenCalledWith({result: false});
  });
});
