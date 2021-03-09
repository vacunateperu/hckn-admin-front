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
  rowGroupMetadata: any;


  constructor(private comunicacionGraficosService: ComunicacionGraficosService, private estadisticasService: EstadisticasService, private leafletService: LeafletService) {


    this.comunicacionGraficosService.lugarSeleccionado.subscribe(lugarPadre => {
      switch (lugarPadre.tipoLugar) {
        case 'PAIS':
          this.estadisticasService.getTablaPromediosDepartamentos().then(departamentos => { //CAMBIAR A FUNCION DE TABLA
            if (departamentos) {
              this.leafletService.getDepartamentos().subscribe(geo_departamentos => {
                for (var i = 0; i < departamentos.length; i++) {
                  var depa = geo_departamentos['features'].find(element => departamentos[i].id_departamento == element['properties']['FIRST_IDDP'])
                  departamentos[i].nombre = depa['properties']['NOMBDEP']
                }
                this.dataTable = departamentos
                this.updateRowGroupMetaData();
              })
            }
          })
          break;
        case 'DEPARTAMENTO':
          this.estadisticasService.getTablaPromediosProvinciasByDepartamentoId(lugarPadre.id).then(provincias => {
            if (provincias) {
              this.leafletService.getProvincias().subscribe((geo_provincias: any) => {

                for (var i = 0; i < provincias.length; i++) {
                  var provi = geo_provincias['features'].find(element => provincias[i].id_provincia == element['properties']['FIRST_IDPR'])
                  provincias[i].nombre = provi['properties']['NOMBPROV']
                }
                this.dataTable = provincias;
              });
            }
          })
          break;
        case 'PROVINCIA':
          this.estadisticasService.getTablaPromediosDistritosByProvinciaId(lugarPadre.id).then(distritos => {
            if (distritos) {
              this.leafletService.getDistritos().subscribe((geo_distritos: any) => {
                for (var i = 0; i < distritos.length; i++) {
                  var dist = geo_distritos['features'].find(element => distritos[i].id_distrito == element['properties']['IDDIST']);
                  distritos[i].nombre = dist['properties']['NOMBDIST']
                }
                this.dataTable = distritos
              });
            }
          })
          break;
        case 'DISTRITO':
          this.dataTable = [];
          break;
      }
    });
  }

  ngOnInit(): void {
  }


  updateRowGroupMetaData() {
    this.rowGroupMetadata = {};

    if (this.dataTable) {
      for (let i = 0; i < this.dataTable.length; i++) {
        let rowData = this.dataTable[i];
        let lugarNombre = rowData.nombre;

        if (i == 0) {
          this.rowGroupMetadata[lugarNombre] = { index: 0, size: 1 };
        }
        else {
          let previousRowData = this.dataTable[i - 1];
          let previousRowGroup = previousRowData.nombre;
          if (lugarNombre === previousRowGroup)
            this.rowGroupMetadata[lugarNombre].size++;
          else
            this.rowGroupMetadata[lugarNombre] = { index: i, size: 1 };
        }
      }
    }
  }

}
