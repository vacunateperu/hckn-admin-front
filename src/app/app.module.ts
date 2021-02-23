import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';

import { PrimengModule } from './primeng/primeng.module';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TemplateMasterComponent } from './components/templates/template-master/template-master.component';
import { MapaComponent } from './components/pages/mapa/mapa.component';
import { GraficosComponent } from './components/pages/graficos/graficos.component';
import { GraficoBarraComponent } from './components/pages/graficos/grafico-barra/grafico-barra.component';
import { GraficoTablaComponent } from './components/pages/graficos/grafico-tabla/grafico-tabla.component';

//LEAFLET FOR MAPS
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { FormsModule }   from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    TemplateMasterComponent,
    MapaComponent,
    GraficosComponent,
    GraficoBarraComponent,
    GraficoTablaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PrimengModule,
    LeafletModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
