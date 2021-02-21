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
        '<h4>Cantidad de vulnerables</h4>' +
        (props ? '<b>' + nombre_area + '</b><br/>' + getPorcentaje(props.prom_vulnerabilidad) + '%.' : 'Seleccione ' + lugarSegunElZoom);
    };

    info.addTo(miMapa);

    //LEYENDA FOOTER
    var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info-mapa legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

      // loop through our density intervals and genera  te a label with a colored square for each interval

      div.innerHTML =
        'Vulnerabilidad acumulada' +
        '<i style="background-color: red"></i> ' +
        '<br>';


      return div;
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
      } else if (zoom < 9) {
        geojson_master = geojson_provincia;
        idColorMapa = 'PROV';
        lugarSegunElZoom = 'una provincia';
      } else {
        geojson_master = geojson_distrito;
        idColorMapa = 'DIST';
        lugarSegunElZoom = 'un distrito';
      }
      pintarMapa(idColorMapa);
      info.update();
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
        .range(['#fbfad7', '#fbf7d4', '#fbf4d1', '#fbf1ce', '#fbeecb', '#fbebc7', '#fbe8c4', '#fce5c1', '#fce2be', '#fcdfbb', '#fcdbb8', '#fcd8b5', '#fcd5b2', '#fcd2af', '#fccfab', '#fccca8', '#fcc9a5', '#fcc6a2', '#fcc39f', '#fdc09c', '#fdbd99', '#fdba96', '#fdb793', '#fdb48f', '#fdb18c', '#fdae89', '#fdab86', '#fda883', '#fda580', '#fda27d', '#fd9e7a', '#fe9b77', '#fe9873', '#fe9570', '#fe926d', '#fe8f6a', '#fe8c67', '#fe8964', '#fe8661', '#fe835e', '#fe805b', '#fe7d57', '#fe7a54', '#fe7751', '#ff744e', '#ff714b', '#ff6e48', '#ff6b45', '#ff6842', '#ff653f', '#fd623c', '#fa603b', '#f75e3a', '#f35c39', '#f05a37', '#ed5836', '#e95635', '#e65434', '#e35233', '#df5031', '#dc4e30', '#d94c2f', '#d54a2e', '#d2482c', '#cf462b', '#cb442a', '#c84229', '#c54027', '#c13e26', '#be3c25', '#bb3a24', '#b73823', '#b43621', '#b13420', '#ad321f', '#aa301e', '#a72e1c', '#a32c1b', '#a02a1a', '#9d2819', '#992617', '#962416', '#932215', '#8f2014', '#8c1e12', '#891c11', '#851a10', '#82180f', '#7f160e', '#7b140c', '#78120b', '#75100a', '#710e09', '#6e0c07', '#6b0a06', '#670805', '#640604', '#610402', '#5d0201', '#5a0000'])
        .domain([rangoMin + d * 1, rangoMin + d * 2, rangoMin + d * 3, rangoMin + d * 4, rangoMin + d * 5, rangoMin + d * 6, rangoMin + d * 7, rangoMin + d * 8, rangoMin + d * 9, rangoMin + d * 10, rangoMin + d * 11, rangoMin + d * 12, rangoMin + d * 13, rangoMin + d * 14, rangoMin + d * 15, rangoMin + d * 16, rangoMin + d * 17, rangoMin + d * 18, rangoMin + d * 19, rangoMin + d * 20, rangoMin + d * 21, rangoMin + d * 22, rangoMin + d * 23, rangoMin + d * 24, rangoMin + d * 25, rangoMin + d * 26, rangoMin + d * 27, rangoMin + d * 28, rangoMin + d * 29, rangoMin + d * 30, rangoMin + d * 31, rangoMin + d * 32, rangoMin + d * 33, rangoMin + d * 34, rangoMin + d * 35, rangoMin + d * 36, rangoMin + d * 37, rangoMin + d * 38, rangoMin + d * 39, rangoMin + d * 40, rangoMin + d * 41, rangoMin + d * 42, rangoMin + d * 43, rangoMin + d * 44, rangoMin + d * 45, rangoMin + d * 46, rangoMin + d * 47, rangoMin + d * 48, rangoMin + d * 49, rangoMin + d * 50, rangoMin + d * 51, rangoMin + d * 52, rangoMin + d * 53, rangoMin + d * 54, rangoMin + d * 55, rangoMin + d * 56, rangoMin + d * 57, rangoMin + d * 58, rangoMin + d * 59, rangoMin + d * 60, rangoMin + d * 61, rangoMin + d * 62, rangoMin + d * 63, rangoMin + d * 64, rangoMin + d * 65, rangoMin + d * 66, rangoMin + d * 67, rangoMin + d * 68, rangoMin + d * 69, rangoMin + d * 70, rangoMin + d * 71, rangoMin + d * 72, rangoMin + d * 73, rangoMin + d * 74, rangoMin + d * 75, rangoMin + d * 76, rangoMin + d * 77, rangoMin + d * 78, rangoMin + d * 79, rangoMin + d * 80, rangoMin + d * 81, rangoMin + d * 82, rangoMin + d * 83, rangoMin + d * 84, rangoMin + d * 85, rangoMin + d * 86, rangoMin + d * 87, rangoMin + d * 88, rangoMin + d * 89, rangoMin + d * 90, rangoMin + d * 91, rangoMin + d * 92, rangoMin + d * 93, rangoMin + d * 94, rangoMin + d * 95, rangoMin + d * 96, rangoMin + d * 97, rangoMin + d * 98, rangoMin + d * 99]);
      return scala(param);
    }

    function getColorProvincia(param) {
      const d = (rangoMax - rangoMin) / 100;
      var scala = scaleThreshold()
        .range(['#dcfbff', '#daf9fd', '#d8f7fb', '#d5f4f9', '#d3f2f7', '#d1eff5', '#cfedf3', '#cceaf1', '#cae8ef', '#c8e5ed', '#c6e3eb', '#c4e1e9', '#c1dee7', '#bfdce5', '#bdd9e3', '#bbd7e1', '#b8d4df', '#b6d2dd', '#b4cfdb', '#b2cdd9', '#b0cad7', '#adc8d5', '#abc6d3', '#a9c3d1', '#a7c1cf', '#a4becd', '#a2bccb', '#a0b9c9', '#9eb7c7', '#9cb4c5', '#99b2c3', '#97b0c1', '#95adbf', '#93abbd', '#90a8bb', '#8ea6b9', '#8ca3b7', '#8aa1b5', '#889eb3', '#859cb1', '#839aaf', '#8197ad', '#7f95ab', '#7c92a9', '#7a90a7', '#788da5', '#768ba3', '#7488a1', '#71869f', '#6f839d', '#6d819a', '#6b7f98', '#687c96', '#667a94', '#647792', '#627590', '#60728e', '#5d708c', '#5b6d8a', '#596b88', '#576986', '#546684', '#526482', '#506180', '#4e5f7e', '#4c5c7c', '#495a7a', '#475778', '#455576', '#435274', '#405072', '#3e4e70', '#3c4b6e', '#3a496c', '#38466a', '#354468', '#334166', '#313f64', '#2f3c62', '#2c3a60', '#2a385e', '#28355c', '#26335a', '#243058', '#212e56', '#1f2b54', '#1d2952', '#1b2650', '#18244e', '#16214c', '#141f4a', '#121d48', '#101a46', '#0d1844', '#0b1542', '#091340', '#07103e', '#040e3c', '#020b3a', '#000938'])
        .domain([rangoMin + d * 1, rangoMin + d * 2, rangoMin + d * 3, rangoMin + d * 4, rangoMin + d * 5, rangoMin + d * 6, rangoMin + d * 7, rangoMin + d * 8, rangoMin + d * 9, rangoMin + d * 10, rangoMin + d * 11, rangoMin + d * 12, rangoMin + d * 13, rangoMin + d * 14, rangoMin + d * 15, rangoMin + d * 16, rangoMin + d * 17, rangoMin + d * 18, rangoMin + d * 19, rangoMin + d * 20, rangoMin + d * 21, rangoMin + d * 22, rangoMin + d * 23, rangoMin + d * 24, rangoMin + d * 25, rangoMin + d * 26, rangoMin + d * 27, rangoMin + d * 28, rangoMin + d * 29, rangoMin + d * 30, rangoMin + d * 31, rangoMin + d * 32, rangoMin + d * 33, rangoMin + d * 34, rangoMin + d * 35, rangoMin + d * 36, rangoMin + d * 37, rangoMin + d * 38, rangoMin + d * 39, rangoMin + d * 40, rangoMin + d * 41, rangoMin + d * 42, rangoMin + d * 43, rangoMin + d * 44, rangoMin + d * 45, rangoMin + d * 46, rangoMin + d * 47, rangoMin + d * 48, rangoMin + d * 49, rangoMin + d * 50, rangoMin + d * 51, rangoMin + d * 52, rangoMin + d * 53, rangoMin + d * 54, rangoMin + d * 55, rangoMin + d * 56, rangoMin + d * 57, rangoMin + d * 58, rangoMin + d * 59, rangoMin + d * 60, rangoMin + d * 61, rangoMin + d * 62, rangoMin + d * 63, rangoMin + d * 64, rangoMin + d * 65, rangoMin + d * 66, rangoMin + d * 67, rangoMin + d * 68, rangoMin + d * 69, rangoMin + d * 70, rangoMin + d * 71, rangoMin + d * 72, rangoMin + d * 73, rangoMin + d * 74, rangoMin + d * 75, rangoMin + d * 76, rangoMin + d * 77, rangoMin + d * 78, rangoMin + d * 79, rangoMin + d * 80, rangoMin + d * 81, rangoMin + d * 82, rangoMin + d * 83, rangoMin + d * 84, rangoMin + d * 85, rangoMin + d * 86, rangoMin + d * 87, rangoMin + d * 88, rangoMin + d * 89, rangoMin + d * 90, rangoMin + d * 91, rangoMin + d * 92, rangoMin + d * 93, rangoMin + d * 94, rangoMin + d * 95, rangoMin + d * 96, rangoMin + d * 97, rangoMin + d * 98, rangoMin + d * 99]);

      return scala(param);
    }

    function getColorDistrito(param) {
      const d = (rangoMax - rangoMin) / 100;
      var scala = scaleThreshold()
        .range(['#f7f6d4', '#f6f6d3', '#f5f6d2', '#f4f6d1', '#f3f6d0', '#f1f7cf', '#f0f7ce', '#eff7cd', '#eef7cc', '#edf7cb', '#ecf7ca', '#eaf7c9', '#e9f7c8', '#e8f7c7', '#e7f8c6', '#e6f8c5', '#e5f8c4', '#e3f8c3', '#e2f8c2', '#e1f8c1', '#e0f8c0', '#dff8bf', '#ddf8be', '#dcf9bd', '#dbf9bc', '#daf9bc', '#d9f9bb', '#d8f9ba', '#d6f9b9', '#d5f9b8', '#d4f9b7', '#d3f9b6', '#d2f9b5', '#d1fab4', '#cffab3', '#cefab2', '#cdfab1', '#ccfab0', '#cbfaaf', '#cafaae', '#c8faad', '#c7faac', '#c6fbab', '#c5fbaa', '#c4fba9', '#c3fba8', '#c1fba7', '#c0fba6', '#bffba5', '#befba4', '#bbf9a2', '#b8f59f', '#b4f19b', '#b0ed98', '#ace995', '#a8e592', '#a4e18e', '#a1dd8b', '#9dd888', '#99d484', '#95d081', '#91cc7e', '#8dc87a', '#8ac477', '#86c074', '#82bc70', '#7eb86d', '#7ab36a', '#77af67', '#73ab63', '#6fa760', '#6ba35d', '#679f59', '#639b56', '#609753', '#5c934f', '#588e4c', '#548a49', '#508645', '#4c8242', '#497e3f', '#457a3c', '#417638', '#3d7235', '#396d32', '#36692e', '#32652b', '#2e6128', '#2a5d24', '#265921', '#22551e', '#1f511a', '#1b4d17', '#174814', '#134411', '#0f400d', '#0b3c0a', '#083807', '#043403', '#003000'])
        .domain([rangoMin + d * 1, rangoMin + d * 2, rangoMin + d * 3, rangoMin + d * 4, rangoMin + d * 5, rangoMin + d * 6, rangoMin + d * 7, rangoMin + d * 8, rangoMin + d * 9, rangoMin + d * 10, rangoMin + d * 11, rangoMin + d * 12, rangoMin + d * 13, rangoMin + d * 14, rangoMin + d * 15, rangoMin + d * 16, rangoMin + d * 17, rangoMin + d * 18, rangoMin + d * 19, rangoMin + d * 20, rangoMin + d * 21, rangoMin + d * 22, rangoMin + d * 23, rangoMin + d * 24, rangoMin + d * 25, rangoMin + d * 26, rangoMin + d * 27, rangoMin + d * 28, rangoMin + d * 29, rangoMin + d * 30, rangoMin + d * 31, rangoMin + d * 32, rangoMin + d * 33, rangoMin + d * 34, rangoMin + d * 35, rangoMin + d * 36, rangoMin + d * 37, rangoMin + d * 38, rangoMin + d * 39, rangoMin + d * 40, rangoMin + d * 41, rangoMin + d * 42, rangoMin + d * 43, rangoMin + d * 44, rangoMin + d * 45, rangoMin + d * 46, rangoMin + d * 47, rangoMin + d * 48, rangoMin + d * 49, rangoMin + d * 50, rangoMin + d * 51, rangoMin + d * 52, rangoMin + d * 53, rangoMin + d * 54, rangoMin + d * 55, rangoMin + d * 56, rangoMin + d * 57, rangoMin + d * 58, rangoMin + d * 59, rangoMin + d * 60, rangoMin + d * 61, rangoMin + d * 62, rangoMin + d * 63, rangoMin + d * 64, rangoMin + d * 65, rangoMin + d * 66, rangoMin + d * 67, rangoMin + d * 68, rangoMin + d * 69, rangoMin + d * 70, rangoMin + d * 71, rangoMin + d * 72, rangoMin + d * 73, rangoMin + d * 74, rangoMin + d * 75, rangoMin + d * 76, rangoMin + d * 77, rangoMin + d * 78, rangoMin + d * 79, rangoMin + d * 80, rangoMin + d * 81, rangoMin + d * 82, rangoMin + d * 83, rangoMin + d * 84, rangoMin + d * 85, rangoMin + d * 86, rangoMin + d * 87, rangoMin + d * 88, rangoMin + d * 89, rangoMin + d * 90, rangoMin + d * 91, rangoMin + d * 92, rangoMin + d * 93, rangoMin + d * 94, rangoMin + d * 95, rangoMin + d * 96, rangoMin + d * 97, rangoMin + d * 98, rangoMin + d * 99]);

      return scala(param);
    }



  }
}