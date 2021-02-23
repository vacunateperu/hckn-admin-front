import { Component, OnInit } from '@angular/core';
import 'leaflet';
import { EstadisticasService } from 'src/app/services/estadisticas.service';
import { LeafletService } from 'src/app/services/leaflet.service';
import { scaleThreshold } from 'd3-scale';


declare let L;


@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements OnInit {

  constructor(private leafletService: LeafletService, private estadisticasService: EstadisticasService) { }

  ngOnInit(): void {

    let miMapa;

    let geojson_master;
    let geojson_distrito;
    let geojson_provincia;
    let geojson_departamento;
    let geojson_layer;

    let lugarSegunElZoom: string = 'un departamento';

    let idColorMapa = 'DEPA';
    let divDegradado = '<div class="dept"></div>';

    let rangoMin = 0.0;
    let rangoMax = 0.6; 

    /************************************************************
                          CARGA DATA GEOJSON
    *************************************************************/

    this.leafletService.getDepartamentos().subscribe(data => {

      this.estadisticasService.getPromediosDepartamentos().then(estadistica => {
        for (var i = 0; i < data['features'].length; i++) {
          var depa = estadistica.find(element => element.id_departamento == data['features'][i]['properties']['FIRST_IDDP']);

          data['features'][i]['properties']['prom_vulnerabilidad'] = depa == undefined ? 0 : depa.prom_vulnerabilidad;
        }
      });
      geojson_departamento = data;
    });

    this.leafletService.getProvincias().subscribe(data => {
      this.estadisticasService.getPromediosProvincias().then(estadistica => {
        for (var i = 0; i < data['features'].length; i++) {
          var provi = estadistica.find(element => element.id_provincia == data['features'][i]['properties']['FIRST_IDPR']);
          data['features'][i]['properties']['prom_vulnerabilidad'] = provi == undefined ? 0 : provi.prom_vulnerabilidad;
        }
      });
      geojson_provincia = data;
    });

    this.leafletService.getDistritos().subscribe(data => {
      this.estadisticasService.getPromediosDistritos().then(estadistica => {
        for (var i = 0; i < data['features'].length; i++) {
          var dist = estadistica.find(element => element.id_distrito == data['features'][i]['properties']['IDDIST']);
          data['features'][i]['properties']['prom_vulnerabilidad'] = dist == undefined ? 0 : dist.prom_vulnerabilidad;
        }
      });
      geojson_distrito = data;
    });

    /************************************************************
                              LAYERS
    *************************************************************/
    miMapa = L.map('vulnerableMapa')
      .setView([-9.89, -74.86], 6)
      .on("zoomend", function (e) {
        cambioMapa(e);
      });

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(miMapa);

    //PINTADO INICIAL
    setTimeout(function () {
      geojson_master = geojson_departamento;
      pintarMapa(idColorMapa);
    }, 3000);


    //INFORMACION NOMBRE Y PORCENTAJE

    let info;

    info = new L.Control();

    info.onAdd = function () {
      this._div = L.DomUtil.create('div', 'info-mapa');
      this.update();
      return this._div;
    };

    info.update = function (props) {
      var nombre_area;
      if (props) {
        if (props.NOMBDIST != undefined) {
          nombre_area = props.NOMBDIST;
        } else if (props.NOMBPROV != undefined) {
          nombre_area = props.NOMBPROV;
        } else {
          nombre_area = props.NOMBDEP;
        }
      }

      this._div.innerHTML =
        '<h4>Promedio de Vulnerables</h4>' +
        (props ? '<b>' + nombre_area + '</b><br/><div class="espacio"></div>' + getPorcentaje(props.prom_vulnerabilidad) + '%.' : 'Seleccione ' + lugarSegunElZoom);
    };

    info.addTo(miMapa);

    //LEYENDA FOOTER
    var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function (map) {

      this.div = L.DomUtil.create('div', 'info-mapa legend');
        //grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        //labels = [];
      this.update();
      return this.div;
    };

    legend.update = function (props) {
      this.div.innerHTML =
        '<div class="text"><div style="float: left">'+rangoMin*100+'%</div><div style="float: right">'+rangoMax*100+'%</div></div>' +
        divDegradado;
    };

    legend.addTo(miMapa);


    /************************************************************
                              FUNCIONES LEAFLET
    *************************************************************/

    function resetHighlight(e) {
      geojson_layer.resetStyle(e.target);
      info.update();
    }

    function highlightFeature(e) {
      const layer = e.target;

      layer.setStyle({
        weight: 5,
        color: '#FFF',
        dashArray: '',
        fillOpacity: 0.8
      });

      if (!L.Browser.ie && !L.Browser.edge) {
        layer.bringToFront();
      }

      info.update(layer.feature.properties);
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
      });
    }


    /************************************************************
                         FUNCIONES PROPIAS
    *************************************************************/
    function cambioMapa(e) {
      var zoom = e.target._zoom;
      if (zoom < 8) {
        geojson_master = geojson_departamento;
        idColorMapa = 'DEPA';
        lugarSegunElZoom = 'un departamento';
        divDegradado = '<div class="dept"></div>';
      } else if (zoom < 9) {
        geojson_master = geojson_provincia;
        idColorMapa = 'PROV';
        lugarSegunElZoom = 'una provincia';
        divDegradado = '<div class="prov"></div>';
      } else {
        geojson_master = geojson_distrito;
        idColorMapa = 'DIST';
        lugarSegunElZoom = 'un distrito';
        divDegradado = '<div class="dist"></div>';
      }
      pintarMapa(idColorMapa);
      info.update();
      legend.update();
    }

    function pintarMapa(idColor) {

      if (geojson_layer != null) {
        miMapa.removeLayer(geojson_layer);
      }

      geojson_layer = L.geoJSON(geojson_master, {
        style: function (feature) {
          return {
            fillColor: getColorMapa(feature.properties.prom_vulnerabilidad/*101*/, idColor),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.8
          };
        },
        onEachFeature: onEachFeature
      }).addTo(miMapa);
    }


    function getColorMapa(param, idColor) {
      switch (idColor) {
        case 'DEPA':
          return getColorDepartamento(param);
        case 'PROV':
          return getColorProvincia(param);
        case 'DIST':
          return getColorDistrito(param);
      }
    }

    function getPorcentaje(num) {
      return (num * 100).toFixed(2);
    }

    function getColorDepartamento(param) {
      const d = (rangoMax - rangoMin) / 100;
      var scala = scaleThreshold()
        .range(['#fff7ec', '#fff5e7', '#fff3e1', '#fff1dc', '#ffefd7', '#ffedd2', '#ffeacd', '#ffe8c8', '#ffe6c4', '#ffe4bf', '#ffe2bb', '#ffdfb6', '#ffddb2', '#ffdbae', '#ffd9aa', '#ffd6a6', '#ffd4a2', '#ffd29e', '#ffcf9a', '#ffcd96', '#ffcb93', '#ffc88f', '#ffc68b', '#ffc388', '#ffc185', '#ffbf81', '#ffbc7e', '#ffba7b', '#ffb778', '#ffb574', '#ffb271', '#ffaf6e', '#ffad6b', '#ffaa68', '#ffa866', '#ffa563', '#ffa260', '#ffa05d', '#ff9d5b', '#ff9a58', '#ff9755', '#ff9553', '#ff9250', '#ff8f4e', '#ff8c4b', '#ff8949', '#ff8647', '#ff8345', '#fe8143', '#fd7e41', '#fc7b40', '#fb793e', '#fb763c', '#fa743b', '#f97139', '#f86e37', '#f76c36', '#f66934', '#f56733', '#f46431', '#f3622f', '#f15f2e', '#f05c2c', '#ef5a2b', '#ee5729', '#ec5528', '#eb5226', '#ea4f25', '#e84d23', '#e74a22', '#e64820', '#e4451f', '#e3421e', '#e1401c', '#df3d1b', '#de3a19', '#dc3818', '#da3517', '#d93315', '#d73014', '#d52d13', '#d32b11', '#d12810', '#cf250f', '#ce230e', '#cc200c', '#c91d0b', '#c71a0a', '#c51809', '#c31507', '#c11206', '#be0f06', '#bc0c05', '#ba0904', '#b70703', '#b50502', '#b20302', '#b00101', '#ad0101', '#aa0000'])
        .domain([rangoMin + d * 1, rangoMin + d * 2, rangoMin + d * 3, rangoMin + d * 4, rangoMin + d * 5, rangoMin + d * 6, rangoMin + d * 7, rangoMin + d * 8, rangoMin + d * 9, rangoMin + d * 10, rangoMin + d * 11, rangoMin + d * 12, rangoMin + d * 13, rangoMin + d * 14, rangoMin + d * 15, rangoMin + d * 16, rangoMin + d * 17, rangoMin + d * 18, rangoMin + d * 19, rangoMin + d * 20, rangoMin + d * 21, rangoMin + d * 22, rangoMin + d * 23, rangoMin + d * 24, rangoMin + d * 25, rangoMin + d * 26, rangoMin + d * 27, rangoMin + d * 28, rangoMin + d * 29, rangoMin + d * 30, rangoMin + d * 31, rangoMin + d * 32, rangoMin + d * 33, rangoMin + d * 34, rangoMin + d * 35, rangoMin + d * 36, rangoMin + d * 37, rangoMin + d * 38, rangoMin + d * 39, rangoMin + d * 40, rangoMin + d * 41, rangoMin + d * 42, rangoMin + d * 43, rangoMin + d * 44, rangoMin + d * 45, rangoMin + d * 46, rangoMin + d * 47, rangoMin + d * 48, rangoMin + d * 49, rangoMin + d * 50, rangoMin + d * 51, rangoMin + d * 52, rangoMin + d * 53, rangoMin + d * 54, rangoMin + d * 55, rangoMin + d * 56, rangoMin + d * 57, rangoMin + d * 58, rangoMin + d * 59, rangoMin + d * 60, rangoMin + d * 61, rangoMin + d * 62, rangoMin + d * 63, rangoMin + d * 64, rangoMin + d * 65, rangoMin + d * 66, rangoMin + d * 67, rangoMin + d * 68, rangoMin + d * 69, rangoMin + d * 70, rangoMin + d * 71, rangoMin + d * 72, rangoMin + d * 73, rangoMin + d * 74, rangoMin + d * 75, rangoMin + d * 76, rangoMin + d * 77, rangoMin + d * 78, rangoMin + d * 79, rangoMin + d * 80, rangoMin + d * 81, rangoMin + d * 82, rangoMin + d * 83, rangoMin + d * 84, rangoMin + d * 85, rangoMin + d * 86, rangoMin + d * 87, rangoMin + d * 88, rangoMin + d * 89, rangoMin + d * 90, rangoMin + d * 91, rangoMin + d * 92, rangoMin + d * 93, rangoMin + d * 94, rangoMin + d * 95, rangoMin + d * 96, rangoMin + d * 97, rangoMin + d * 98, rangoMin + d * 99]);
      return scala(param);
    }

    function getColorProvincia(param) {
      const d = (rangoMax - rangoMin) / 100;
      var scala = scaleThreshold()
        .range(['#fff7fb', '#fcf4fb', '#f8f2fb', '#f5effb', '#f1edfb', '#eeeafb', '#eae8fb', '#e6e5fb', '#e2e3fa', '#dee1fa', '#dadefa', '#d6dcf9', '#d2daf9', '#cdd8f8', '#c9d5f8', '#c5d3f7', '#c0d1f7', '#bbcff6', '#b6cdf5', '#b2cbf5', '#adc9f4', '#a7c7f3', '#a2c5f2', '#9dc3f1', '#97c1f1', '#91bff0', '#8bbdef', '#85bbee', '#7fb9ed', '#79b7ec', '#72b5eb', '#6ab3e9', '#63b1e8', '#5aafe7', '#51aee6', '#48ace5', '#47a9e3', '#45a6e2', '#43a4e0', '#41a1df', '#3f9edd', '#3e9cdb', '#3c99da', '#3a97d8', '#3994d6', '#3791d4', '#358fd2', '#348cd0', '#328ace', '#3187cc', '#2f85ca', '#2e82c8', '#2c7fc6', '#2b7dc4', '#2a7ac1', '#2878bf', '#2776bd', '#2673bb', '#2471b8', '#236eb6', '#226cb4', '#2169b1', '#1f67af', '#1e64ad', '#1d62aa', '#1c60a8', '#1b5da5', '#1a5ba3', '#1859a1', '#17569e', '#16549c', '#155299', '#144f97', '#134d94', '#124b92', '#11488f', '#10468d', '#0f448a', '#0e4188', '#0d3f85', '#0c3d83', '#0c3b80', '#0b397d', '#0a367b', '#093478', '#083276', '#073073', '#062e71', '#062c6e', '#05296b', '#042769', '#042566', '#032364', '#032161', '#021f5f', '#021d5c', '#011b59', '#011957', '#001754', '#001552'])
        .domain([rangoMin + d * 1, rangoMin + d * 2, rangoMin + d * 3, rangoMin + d * 4, rangoMin + d * 5, rangoMin + d * 6, rangoMin + d * 7, rangoMin + d * 8, rangoMin + d * 9, rangoMin + d * 10, rangoMin + d * 11, rangoMin + d * 12, rangoMin + d * 13, rangoMin + d * 14, rangoMin + d * 15, rangoMin + d * 16, rangoMin + d * 17, rangoMin + d * 18, rangoMin + d * 19, rangoMin + d * 20, rangoMin + d * 21, rangoMin + d * 22, rangoMin + d * 23, rangoMin + d * 24, rangoMin + d * 25, rangoMin + d * 26, rangoMin + d * 27, rangoMin + d * 28, rangoMin + d * 29, rangoMin + d * 30, rangoMin + d * 31, rangoMin + d * 32, rangoMin + d * 33, rangoMin + d * 34, rangoMin + d * 35, rangoMin + d * 36, rangoMin + d * 37, rangoMin + d * 38, rangoMin + d * 39, rangoMin + d * 40, rangoMin + d * 41, rangoMin + d * 42, rangoMin + d * 43, rangoMin + d * 44, rangoMin + d * 45, rangoMin + d * 46, rangoMin + d * 47, rangoMin + d * 48, rangoMin + d * 49, rangoMin + d * 50, rangoMin + d * 51, rangoMin + d * 52, rangoMin + d * 53, rangoMin + d * 54, rangoMin + d * 55, rangoMin + d * 56, rangoMin + d * 57, rangoMin + d * 58, rangoMin + d * 59, rangoMin + d * 60, rangoMin + d * 61, rangoMin + d * 62, rangoMin + d * 63, rangoMin + d * 64, rangoMin + d * 65, rangoMin + d * 66, rangoMin + d * 67, rangoMin + d * 68, rangoMin + d * 69, rangoMin + d * 70, rangoMin + d * 71, rangoMin + d * 72, rangoMin + d * 73, rangoMin + d * 74, rangoMin + d * 75, rangoMin + d * 76, rangoMin + d * 77, rangoMin + d * 78, rangoMin + d * 79, rangoMin + d * 80, rangoMin + d * 81, rangoMin + d * 82, rangoMin + d * 83, rangoMin + d * 84, rangoMin + d * 85, rangoMin + d * 86, rangoMin + d * 87, rangoMin + d * 88, rangoMin + d * 89, rangoMin + d * 90, rangoMin + d * 91, rangoMin + d * 92, rangoMin + d * 93, rangoMin + d * 94, rangoMin + d * 95, rangoMin + d * 96, rangoMin + d * 97, rangoMin + d * 98, rangoMin + d * 99]);

      return scala(param);
    }

    function getColorDistrito(param) {
      const d = (rangoMax - rangoMin) / 100;
      var scala = scaleThreshold()
        .range(['#f7fcf5', '#f2fbef', '#edfae9', '#e7f8e3', '#e2f7de', '#ddf5d8', '#d8f4d3', '#d3f2ce', '#cff1c8', '#caefc3', '#c5eebf', '#c0ecba', '#bbebb5', '#b6e9b0', '#b2e7ac', '#ade6a7', '#a8e4a3', '#a4e29f', '#9fe09a', '#9adf96', '#95dd92', '#91db8e', '#8cd98a', '#87d786', '#82d582', '#7ed47e', '#79d27a', '#74d076', '#6fce72', '#6acc6e', '#65ca6b', '#5fc867', '#5cc665', '#5ac463', '#57c161', '#54bf5f', '#52bd5d', '#50ba5b', '#4db85a', '#4bb658', '#48b356', '#46b154', '#44af53', '#42ac51', '#40aa4f', '#3da84e', '#3ba54c', '#39a34a', '#37a149', '#359e47', '#339c45', '#319a44', '#2f9842', '#2d9541', '#2b933f', '#2a913d', '#288e3c', '#268c3a', '#248a39', '#228737', '#218536', '#1f8334', '#1d8133', '#1c7e31', '#1a7c30', '#197a2e', '#17782d', '#15752c', '#14732a', '#127129', '#116f27', '#0f6c26', '#0e6a25', '#0c6823', '#0b6622', '#0a6421', '#08611f', '#075f1e', '#065d1d', '#055b1b', '#04591a', '#035619', '#025417', '#025216', '#015015', '#014e14', '#004c12', '#004a11', '#004810', '#00450f', '#00430d', '#00410c', '#003f0b', '#003d09', '#003b08', '#003906', '#003705', '#003503', '#003302', '#003100'])
        .domain([rangoMin + d * 1, rangoMin + d * 2, rangoMin + d * 3, rangoMin + d * 4, rangoMin + d * 5, rangoMin + d * 6, rangoMin + d * 7, rangoMin + d * 8, rangoMin + d * 9, rangoMin + d * 10, rangoMin + d * 11, rangoMin + d * 12, rangoMin + d * 13, rangoMin + d * 14, rangoMin + d * 15, rangoMin + d * 16, rangoMin + d * 17, rangoMin + d * 18, rangoMin + d * 19, rangoMin + d * 20, rangoMin + d * 21, rangoMin + d * 22, rangoMin + d * 23, rangoMin + d * 24, rangoMin + d * 25, rangoMin + d * 26, rangoMin + d * 27, rangoMin + d * 28, rangoMin + d * 29, rangoMin + d * 30, rangoMin + d * 31, rangoMin + d * 32, rangoMin + d * 33, rangoMin + d * 34, rangoMin + d * 35, rangoMin + d * 36, rangoMin + d * 37, rangoMin + d * 38, rangoMin + d * 39, rangoMin + d * 40, rangoMin + d * 41, rangoMin + d * 42, rangoMin + d * 43, rangoMin + d * 44, rangoMin + d * 45, rangoMin + d * 46, rangoMin + d * 47, rangoMin + d * 48, rangoMin + d * 49, rangoMin + d * 50, rangoMin + d * 51, rangoMin + d * 52, rangoMin + d * 53, rangoMin + d * 54, rangoMin + d * 55, rangoMin + d * 56, rangoMin + d * 57, rangoMin + d * 58, rangoMin + d * 59, rangoMin + d * 60, rangoMin + d * 61, rangoMin + d * 62, rangoMin + d * 63, rangoMin + d * 64, rangoMin + d * 65, rangoMin + d * 66, rangoMin + d * 67, rangoMin + d * 68, rangoMin + d * 69, rangoMin + d * 70, rangoMin + d * 71, rangoMin + d * 72, rangoMin + d * 73, rangoMin + d * 74, rangoMin + d * 75, rangoMin + d * 76, rangoMin + d * 77, rangoMin + d * 78, rangoMin + d * 79, rangoMin + d * 80, rangoMin + d * 81, rangoMin + d * 82, rangoMin + d * 83, rangoMin + d * 84, rangoMin + d * 85, rangoMin + d * 86, rangoMin + d * 87, rangoMin + d * 88, rangoMin + d * 89, rangoMin + d * 90, rangoMin + d * 91, rangoMin + d * 92, rangoMin + d * 93, rangoMin + d * 94, rangoMin + d * 95, rangoMin + d * 96, rangoMin + d * 97, rangoMin + d * 98, rangoMin + d * 99]);

      return scala(param);
    }



  }
}