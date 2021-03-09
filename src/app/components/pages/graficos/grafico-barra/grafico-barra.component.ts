import { Component, Input, OnInit } from '@angular/core';
import { ComunicacionGraficosService } from 'src/app/services/comunicacion-graficos.service';
import { EstadisticasService } from 'src/app/services/estadisticas.service';
import { LeafletService } from 'src/app/services/leaflet.service';

@Component({
  selector: 'app-grafico-barra',
  templateUrl: './grafico-barra.component.html',
  styleUrls: ['./grafico-barra.component.scss']
})
export class GraficoBarraComponent implements OnInit {

  dataBarras: any;
  previaDataBarras: any;

  //lugarSeleccionado: string = '';

  constructor(private comunicacionGraficosService: ComunicacionGraficosService, private estadisticasService: EstadisticasService, private leafletService: LeafletService) {

    this.comunicacionGraficosService.lugarSeleccionado.subscribe(lugarPadre => {

     
      switch (lugarPadre.tipoLugar) {
        case 'PAIS':
          this.estadisticasService.getPromediosDepartamentos().then(departamentos=>{
              if(departamentos){
                this.leafletService.getDepartamentos().subscribe(geo_departamentos=>{
                  for(var i=0; i<departamentos.length;i++){
                    var depa= geo_departamentos['features'].find(element=> departamentos[i].id_departamento == element['properties']['FIRST_IDDP'])
                    departamentos[i].nombre=depa['properties']['NOMBDEP']
                  }
                  this.previaDataBarras=departamentos
                  this.updateDataBarras(`DEPARTAMENTOS DE ${lugarPadre.nombre}`);
                })
              }
          })
          break;


        case 'DEPARTAMENTO':
          this.estadisticasService.getPromediosProvinciasPorDepartamentoId(lugarPadre.id).then(provincias => {
            if (provincias) {
              this.leafletService.getProvincias().subscribe((geo_provincias: any) => {

                for (var i = 0; i < provincias.length; i++) {
                  var provi = geo_provincias['features'].find(element => provincias[i].id_provincia == element['properties']['FIRST_IDPR'])
                  provincias[i].nombre = provi['properties']['NOMBPROV']
                }
                this.previaDataBarras = provincias;
                this.updateDataBarras(`PROVINCIAS DE ${lugarPadre.nombre}`);
              });

            }
          })
          break;

        case 'PROVINCIA':
          this.estadisticasService.getPromediosDistritosPorProvinciaId(lugarPadre.id).then(distritos => {
            if (distritos) {
              this.leafletService.getDistritos().subscribe((geo_distritos: any) => {
                for (var i = 0; i < distritos.length; i++) {
                  var dist = geo_distritos['features'].find(element => distritos[i].id_distrito == element['properties']['IDDIST']);
                  distritos[i].nombre = dist['properties']['NOMBDIST']
                }
                this.previaDataBarras = distritos
                this.updateDataBarras(`DISTRITOS DE ${lugarPadre.nombre}`)
              });
            }
          })

          break


        case 'DISTRITO':
          console.log('CARGANDO ESTADISTICAS DE DISTRITO')
          break;


      }


    })



  }

  ngOnInit(): void {
  }


  updateDataBarras(label: string) {

    this.dataBarras = {
      labels: this.previaDataBarras.map(item => {
        return item.nombre
      }),
      datasets: [
        {
          label: label,
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          data: this.previaDataBarras.map(item => {
            return item.prom_vulnerabilidad
          })
        }
      ]
    }

  }

}
