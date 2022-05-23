import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryRecordsComponent } from './inventory-records.component';

describe('InventoryRecordsComponent', () => {
  let component: InventoryRecordsComponent;
  let fixture: ComponentFixture<InventoryRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryRecordsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
