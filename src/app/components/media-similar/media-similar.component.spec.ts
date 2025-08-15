import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaSimilarComponent } from './media-similar.component';

describe('MediaSimilarComponent', () => {
  let component: MediaSimilarComponent;
  let fixture: ComponentFixture<MediaSimilarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaSimilarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaSimilarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
