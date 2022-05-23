import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryChartsComponent } from './inventory-charts/inventory-charts.component';
import { InventoryRecordsComponent } from './inventory-records/inventory-records.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: '',
    component: InventoryRecordsComponent
  },
  {
    path: 'charts',
    component: InventoryChartsComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
