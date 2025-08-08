import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaCastComponent } from './media-cast.component';

describe('MediaCastComponent', () => {
  let component: MediaCastComponent;
  let fixture: ComponentFixture<MediaCastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaCastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaCastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
