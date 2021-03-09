import { Component, OnInit } from '@angular/core';
import { AutoComplete } from 'primeng/autocomplete';
import { Autocomplete } from 'src/app/models/autocomplete';
import { ComunicacionGraficosService } from 'src/app/services/comunicacion-graficos.service';
import { EstadisticasService } from 'src/app/services/estadisticas.service';
import { GraficoBarraComponent } from './grafico-barra/grafico-barra.component';

@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.scss']
})
export class GraficosComponent implements OnInit {

  autocompleteDepartamento: Autocomplete;
  autocompleteProvincia: Autocomplete;
  autocompleteDistrito: Autocomplete;

  listaDepartamentos: Autocomplete[];
  listaProvincias: Autocomplete[];
  listaDistritos: Autocomplete[];

  filtradoDepartamentos: Autocomplete[];
  filtradoProvincias: Autocomplete[];
  filtradoDistritos: Autocomplete[];

  disabledProvincias='true';
  disabledDistritos='true';


  constructor(private estadisticasService: EstadisticasService, private comunicacionGraficosService: ComunicacionGraficosService) { }

  ngOnInit(): void {
    this.estadisticasService.getDepartamentosNombres().then(data =>{
      this.listaDepartamentos = data;
    });
    
    var pais={
      id:'0',
      nombre:'PERU',
      tipoLugar: 'PAIS'
    }
    this.comunicacionGraficosService.seleccionarLugar(pais);
  }

  busquedaDepartamento(event) {
    let query = event.query;
    this.resetDropProvincias();
    this.filtradoDepartamentos = this.listaDepartamentos.filter(item => {
      return item.nombre.includes(query.toUpperCase());
    });
  }

  seleccionDepartamento(lugar){
    this.disabledProvincias = 'false';
    var idDepartamento = lugar.id;
    lugar.tipoLugar='DEPARTAMENTO'
    this.comunicacionGraficosService.seleccionarLugar(lugar);
    this.estadisticasService.getProvinciasNombresPorDepartamentoId(idDepartamento).then(data => {
      this.listaProvincias = data;
    });
  }

  busquedaProvincia(lugar) {
    let query = lugar.query;
    this.resetDropDistritos();
    this.filtradoProvincias = this.listaProvincias.filter(item => {
      return item.nombre.includes(query.toUpperCase());
    });
  }

  seleccionProvincia(lugar){
    this.disabledDistritos = 'false';
    var idProvincia = lugar.id;
    lugar.tipoLugar='PROVINCIA'
    this.comunicacionGraficosService.seleccionarLugar(lugar);
    this.estadisticasService.getDistritosNombresPorProvinciaId(idProvincia).then(data => {
      this.listaDistritos = data;
    });
  }

  resetDropProvincias(){
    this.disabledProvincias = 'true';
    this.listaProvincias=null;
    this.filtradoProvincias=null;
    this.autocompleteProvincia=null;
    this.resetDropDistritos();
  }

  busquedaDistrito(event) {
    let query = event.query;
    this.filtradoDistritos = this.listaDistritos.filter(item => {
      return item.nombre.includes(query.toUpperCase());
    });
  }
  
  seleccionDistrito(lugar){
    lugar.tipoLugar='DISTRITO'
    this.comunicacionGraficosService.seleccionarLugar(lugar);
  }


  resetDropDistritos(){
    this.disabledDistritos = 'true';
    this.listaDistritos=null;
    this.filtradoDistritos=null;
    this.autocompleteDistrito=null;
  }

}
