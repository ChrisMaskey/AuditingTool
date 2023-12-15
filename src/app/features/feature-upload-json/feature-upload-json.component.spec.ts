import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureUploadJsonComponent } from './feature-upload-json.component';

describe('FeatureUploadJsonComponent', () => {
  let component: FeatureUploadJsonComponent;
  let fixture: ComponentFixture<FeatureUploadJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureUploadJsonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatureUploadJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
