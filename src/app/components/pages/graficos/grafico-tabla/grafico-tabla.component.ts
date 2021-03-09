import { Component, OnInit } from '@angular/core';
import { DataTable } from 'src/app/models/dataTable';
import { ComunicacionGraficosService } from 'src/app/services/comunicacion-graficos.service';
import { EstadisticasService } from 'src/app/services/estadisticas.service';
import { LeafletService } from 'src/app/services/leaflet.service';

@Component({
  selector: 'app-grafico-tabla',
  templateUrl: './grafico-tabla.component.html',
  styleUrls: ['./grafico-tabla.component.scss']
})
export class GraficoTablaComponent implements OnInit {

  dataTable: DataTable[];

  constructor(private comunicacionGraficosService: ComunicacionGraficosService,private estadisticasService: EstadisticasService, private leafletService: LeafletService) { 
    
    
    this.comunicacionGraficosService.lugarSeleccionado.subscribe(lugarPadre =>{
      switch(lugarPadre.tipoLugar){
        case 'PAIS':
          console.log('CASE EN '+lugarPadre.tipoLugar)
          this.estadisticasService.getPromediosDepartamentos().then(departamentos=>{ //CAMBIAR A FUNCION DE TABLA
            if(departamentos){
             // this.
            }
          })
          break;
        case 'DEPARTAMENTO':
          console.log('CASE EN '+lugarPadre.tipoLugar)
          break;
        case 'PROVINCIA':
          console.log('CASE EN '+lugarPadre.tipoLugar)
          break;
        case 'DISTRITO':
          console.log('CASE EN '+lugarPadre.tipoLugar)
          break;
      }
    });
  }

  ngOnInit(): void {
  }

}
