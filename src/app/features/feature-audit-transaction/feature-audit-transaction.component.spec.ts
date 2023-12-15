import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureAuditTransactionComponent } from './feature-audit-transaction.component';

describe('FeatureAuditTransactionComponent', () => {
  let component: FeatureAuditTransactionComponent;
  let fixture: ComponentFixture<FeatureAuditTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureAuditTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatureAuditTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
