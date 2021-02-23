import { Component, OnInit } from '@angular/core';
import { AutoComplete } from 'primeng/autocomplete';
import { Autocomplete } from 'src/app/models/autocomplete';
import { EstadisticasService } from 'src/app/services/estadisticas.service';

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

  constructor(private estadisticasService: EstadisticasService) { }

  ngOnInit(): void {
    this.estadisticasService.getDepartamentosNombres().then(data =>{
      this.listaDepartamentos = data;
    });
  }

  busquedaDepartamento(event) {
    let query = event.query;
    this.resetDropProvincias();
    this.filtradoDepartamentos = this.listaDepartamentos.filter(item => {
      return item.nombre.includes(query.toUpperCase());
    });
  }

  seleccionDepartamento(event){
    this.disabledProvincias = 'false';
    var idDepartamento = event.id;
    this.estadisticasService.getProvinciasNombresPorDepartamentoId(idDepartamento).then(data => {
      this.listaProvincias = data;
    });
  }

  busquedaProvincia(event) {
    let query = event.query;
    this.resetDropDistritos();
    this.filtradoProvincias = this.listaProvincias.filter(item => {
      return item.nombre.includes(query.toUpperCase());
    });
  }

  seleccionProvincia(event){
    this.disabledDistritos = 'false';
    var idProvincia = event.id;
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

  resetDropDistritos(){
    this.disabledDistritos = 'true';
    this.listaDistritos=null;
    this.filtradoDistritos=null;
    this.autocompleteDistrito=null;
  }

}
