import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-template-master',
  templateUrl: './template-master.component.html',
  styleUrls: ['./template-master.component.scss']
})
export class TemplateMasterComponent implements OnInit {

  selected: string;

  constructor() { }

  ngOnInit(): void {
    this.selected = 'Mapa';
    this.evaluaSeleccion();
  }

  seleccionMapa(){ this.selected = 'Mapa'; this.evaluaSeleccion();}
  seleccionGraficos(){ this.selected = 'Graficos'; this.evaluaSeleccion();}

  evaluaSeleccion(){
    if(this.selected == 'Mapa'){
      document.documentElement.style.setProperty('--fondo-barra', 'none');
      document.documentElement.style.setProperty('--fondo-mapa-btn', '#444');
      document.documentElement.style.setProperty('--texto-mapa-btn', 'white');
      document.documentElement.style.setProperty('--fondo-graficos-btn', 'white');
      document.documentElement.style.setProperty('--texto-graficos-btn', 'gray');
    } else {
      document.documentElement.style.setProperty('--fondo-barra', 'lightgray');
      document.documentElement.style.setProperty('--fondo-mapa-btn', 'white');
      document.documentElement.style.setProperty('--texto-mapa-btn', 'gray');
      document.documentElement.style.setProperty('--fondo-graficos-btn', '#444');
      document.documentElement.style.setProperty('--texto-graficos-btn', 'white');
    }
  }

}
