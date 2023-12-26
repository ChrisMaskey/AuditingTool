import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchTransactionComponent } from './fetch-transaction.component';

describe('FetchTransactionComponent', () => {
  let component: FetchTransactionComponent;
  let fixture: ComponentFixture<FetchTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchTransactionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FetchTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
