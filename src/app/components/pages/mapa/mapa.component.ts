import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { EstadisticasService } from 'src/app/services/estadisticas.service';
import { LeafletService } from 'src/app/services/leaflet.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements OnInit {

  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '...'
      })
    ],
    zoom: 7,
    center: L.latLng(47.482019, -1)
  };


  overlays: any[];

  constructor(private leafletService: LeafletService, private estadisticasService: EstadisticasService) { }

  ngOnInit(): void {
  }

  onMapReady(map: L.Map) {
    
    var jsonDepartamento = null;
    var jsonProvincia = null;
    var jsonDistrito = null;
    var jsonMapa = null;
    var idColorMapa = 'DEPA';
    var geojson;

    this.leafletService.getDepartamentos().subscribe(data =>{
      //console.log(data)
      this.estadisticasService.getPromediosDepartamentos().then(estadistica=>{
        for (var i = 0; i < data['features'].length; i++) {
          var  depa = estadistica.find(element => element.id_departamento == data['features'][i]['properties']['FIRST_IDDP']);
         
          data['features'][i]['properties']['prom_vulnerabilidad'] = depa == undefined ? 0 : depa.prom_vulnerabilidad;
        }
      });
      jsonDepartamento=data;
    });

    this.leafletService.getProvincias().subscribe(data =>{
      this.estadisticasService.getPromediosProvincias().then(estadistica=>{
        for (var i = 0; i < data['features'].length; i++) {
          var provi = estadistica.find(element => element.id_provincia == data['features'][i]['properties']['FIRST_IDPR']);
          data['features'][i]['properties']['prom_vulnerabilidad'] = provi == undefined ? 0 : provi.prom_vulnerabilidad;
        }
      });
      jsonProvincia=data;
    });

    this.leafletService.getDistritos().subscribe(data =>{
      this.estadisticasService.getPromediosDistritos().then(estadistica=>{
        for (var i = 0; i < data['features'].length; i++) {
          var dist = estadistica.find(element => element.id_distrito == data['features'][i]['properties']['IDDIST']);
          data['features'][i]['properties']['prom_vulnerabilidad'] = dist == undefined ? 0 : dist.prom_vulnerabilidad;
        }
      });
          jsonDistrito=data;
    });


    
    
    
    map.setView([-9.89, -74.86], 6);

    map.on("zoomend", function (e) {
      cambioMapa(e);
    });

    // Pintado Inicial del Mapa (por jsonMapa por Departamentos, y con el idcolorMapa 'DEPA')
    setTimeout(function(){ jsonMapa = jsonDepartamento; pintarMapa(jsonMapa, idColorMapa)}, 2000);
    //jsonMapa = jsonDepartamento;
    //pintarMapa(jsonMapa, idColorMapa);

    function cambioMapa(e) {
      var zoom = e.target._zoom;
      //console.log('zoom: '+zoom);

      if(zoom < 8){
        jsonMapa = jsonDepartamento;
        idColorMapa='DEPA';
      } else if(zoom < 9){
        jsonMapa = jsonProvincia;
        idColorMapa='PROV';
      } else {
        jsonMapa = jsonDistrito;
        idColorMapa='DIST';
      }
      /*
      switch (zoom) {
        case ZOOM_DEPARTAMENTO: 
          jsonMapa = jsonDeparmento;
          idColorMapa='DEPA';
          break;
        case ZOOM_PROVINCIA:
          jsonMapa = jsonProvincia;
          idColorMapa='PROV';
          break;
        case ZOOM_DISTRITO:
          jsonMapa = jsonDistrito;
          idColorMapa='DIST';
          break;
      }
      */      
      pintarMapa(jsonMapa, idColorMapa);

    }

    function highlightFeature(e) {
      var layer = e.target;
  
      layer.setStyle({
          weight: 5,
          color: '#FFF',
          dashArray: '',
          fillOpacity: 0.8
      });
  
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          layer.bringToFront();
      }
    }

    function resetHighlight(e) {
      geojson.resetStyle(e.target);
    }

    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
      layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: zoomToFeature
      });
    }

    function pintarMapa(jsonM, idColor){
      //console.log('Pinto el mapa con el idColor: '+ idColor+' y con el json:');
      //console.log(jsonM);
      if(geojson != null){
        map.removeLayer(geojson);
        //console.log('limpia')
      }

      geojson = L.geoJSON(jsonM, {
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
      }).addTo(map);
    }

    function getColorMapa(param, idColor){
      switch(idColor){
        case 'DEPA':
          return getColorDepartamento(param);
        case 'PROV':
          return getColorProvincia(param);
        case 'DIST':
          return getColorDistrito(param);
      }
    }
    
    function getColorDepartamento(d) {
      return d > 0.505 ? '#800026' :
        d > 0.501 ? '#BD0026' :
          d > 0.497 ? '#E31A1C' :
            d > 0.493 ? '#FC4E2A' :
              d > 0.489 ? '#FD8D3C' :
                d > 0.485 ? '#FEB24C' :
                  d > 0.481 ? '#FED976' :
                    '#FFEDA0';
    }

    function getColorProvincia(d) {
      return d > 0.60 ? '#08306B' :
        d > 0.50 ? '#08519C' :
          d > 0.48 ? '#2171B5' :
            d > 0.46 ? '#4294C6' :
              d > 0.44 ? '#6BAED6' :
                d > 0.42 ? '#9ECAE1' :
                  d > 0.40 ? '#C6DBEF' :
                    '#DEEBF7';
    }

    function getColorDistrito(d) {
      return d > 0.60 ? '#00441B' :
        d > 0.50 ? '#006D2C' :
          d > 0.48 ? '#238B45' :
            d > 0.46 ? '#41AB5D' :
              d > 0.44 ? '#74C476' :
                d > 0.42 ? '#A1D99B' :
                  d > 0.40 ? '#C7E9C0' :
                    '#E5F5E0';
    }

  }

  /*
  loadJsonDepartamentos(): any{
    return this.leafletService.getDepartamentos().subscribe();
  }

  loadJsonProvincias(){
    return this.leafletService.getProvincias().subscribe();
  }

  loadJsonDistritos(){
    return this.leafletService.getDistritos().subscribe();
  }
  */

  /*
  añadirPromedioCalculado(){
    for (var i = 0; i < json['features'].length; i++) {
      json['features'][i]['properties']['promedio'] = 500;
      console.log(json['features'][i]); 
    }
  }
  */

}
