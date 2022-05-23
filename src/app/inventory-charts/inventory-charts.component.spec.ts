import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryChartsComponent } from './inventory-charts.component';

describe('InventoryChartsComponent', () => {
  let component: InventoryChartsComponent;
  let fixture: ComponentFixture<InventoryChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryChartsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
