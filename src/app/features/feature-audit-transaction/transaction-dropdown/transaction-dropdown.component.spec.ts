import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDropdownComponent } from './transaction-dropdown.component';

describe('TransactionDropdownComponent', () => {
  let component: TransactionDropdownComponent;
  let fixture: ComponentFixture<TransactionDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
