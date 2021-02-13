import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// MODULOS DE PRIMENG
import {TableModule} from 'primeng/table';
import {GMapModule} from 'primeng/gmap';
import {ChartModule} from 'primeng/chart';
import {ButtonModule} from 'primeng/button';
import {TabViewModule} from 'primeng/tabview';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TableModule,
    GMapModule,
    ChartModule,
    ButtonModule,
    TabViewModule
    
  ],
  exports: [
    TableModule,
    GMapModule,
    ChartModule,
    ButtonModule,
    TabViewModule
  ]
})
export class PrimengModule { }
