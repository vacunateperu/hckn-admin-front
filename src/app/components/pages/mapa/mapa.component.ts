import { Component, OnInit } from '@angular/core';
import 'leaflet';
import { EstadisticasService } from 'src/app/services/estadisticas.service';
import { LeafletService } from 'src/app/services/leaflet.service';

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

    let idColorMapa = 'DEPA';

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
        (props ? '<b>' + nombre_area + '</b>' + getPorcentaje(props.prom_vulnerabilidad) + '%.' : 'Pasa el mouse');
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
          'Vulnerabilidad acumulada'+
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
      } else if (zoom < 9) {
        geojson_master = geojson_provincia;
        idColorMapa = 'PROV';
      } else {
        geojson_master = geojson_distrito;
        idColorMapa = 'DIST';
      }
      pintarMapa(idColorMapa);
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


    function getColorDepartamento(d) {
      return d > 0.45 ? '#800026' :
        d > 0.394 ? '#BD0026' :
          d > 0.338 ? '#E31A1C' :
            d > 0.282 ? '#FC4E2A' :
              d > 0.226 ? '#FD8D3C' :
                d > 0.17 ? '#FEB24C' :
                  d > 0.114 ? '#FED976' :
                    '#FFEDA0';
    }

    function getColorProvincia(d) {
      return d > 0.45 ? '#08306B' :
        d > 0.394 ? '#08519C' :
          d > 0.338 ? '#2171B5' :
            d > 0.282 ? '#4294C6' :
              d > 0.226 ? '#6BAED6' :
                d > 0.17 ? '#9ECAE1' :
                  d > 0.114 ? '#C6DBEF' :
                    '#DEEBF7';
    }

    function getColorDistrito(d) {
      return d > 0.45 ? '#00441B' :
        d > 0.394 ? '#006D2C' :
          d > 0.338 ? '#238B45' :
            d > 0.282 ? '#41AB5D' :
              d > 0.226 ? '#74C476' :
                d > 0.17 ? '#A1D99B' :
                  d > 0.114 ? '#C7E9C0' :
                    '#E5F5E0';
    }
  }
}