import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrailerPlayerModalComponent } from './trailer-player-modal.component';

describe('TrailerPlayerModalComponent', () => {
  let component: TrailerPlayerModalComponent;
  let fixture: ComponentFixture<TrailerPlayerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrailerPlayerModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrailerPlayerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
