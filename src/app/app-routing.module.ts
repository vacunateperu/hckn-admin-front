import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GraficosComponent } from './components/pages/graficos/graficos.component';
import { MapaComponent } from './components/pages/mapa/mapa.component';
import { TemplateMasterComponent } from './components/templates/template-master/template-master.component';

const routes: Routes = [
  {path:'', component: TemplateMasterComponent, children:[
    {path:'', component: MapaComponent},
    {path:'mapa', component: MapaComponent},
    {path:'graficos', component: GraficosComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
