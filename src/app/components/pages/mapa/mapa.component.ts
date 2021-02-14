import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
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

  constructor(private leafletService: LeafletService) { }

  ngOnInit(): void {
  }

  onMapReady(map: L.Map) {
    
    var jsonDepartamento = null;
    var jsonProvincia = null;
    var jsonDistrito = null;
    var jsonMapa = null;
    var idColorMapa = 'DEPA';

    this.leafletService.getDepartamentos().subscribe(data =>{
      jsonDepartamento=data;
    });
    this.leafletService.getProvincias().subscribe(data =>{
      jsonProvincia=data;
    });

    this.leafletService.getDistritos().subscribe(data =>{
      jsonDistrito=data;
    });
    
    
    map.setView([-9.89, -74.86], 6);

    map.on("zoomend", function (e) {
      cambioMapa(e);
    });

    // Pintado Inicial del Mapa (por jsonMapa por Departamentos, y con el idcolorMapa 'DEPA')
    setTimeout(function(){ jsonMapa = jsonDepartamento; pintarMapa(jsonMapa, idColorMapa)}, 1000);
    //jsonMapa = jsonDepartamento;
    //pintarMapa(jsonMapa, idColorMapa);


    function cambioMapa(e) {
      var zoom = e.target._zoom;
      //console.log('zoom: '+zoom);

      if(zoom < 7){
        jsonMapa = jsonDepartamento;
        idColorMapa='DEPA';
      } else if(zoom < 10){
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
    var layer: L.Layer = null;
    function pintarMapa(jsonM, idColor){
      //console.log('Pinto el mapa con el idColor: '+ idColor+' y con el json:');
      //console.log(jsonM);
      if(layer != null){
        map.removeLayer(layer);

      }

      layer = L.geoJSON(jsonM, {
        style: function (feature) {
          return {
            fillColor: getColorMapa(feature.properties.COUNT/*101*/, idColor),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
          };
        }

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
      return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
          d > 200 ? '#E31A1C' :
            d > 100 ? '#FC4E2A' :
              d > 50 ? '#FD8D3C' :
                d > 20 ? '#FEB24C' :
                  d > 10 ? '#FED976' :
                    '#FFEDA0';
    }

    function getColorProvincia(d) {
      return d > 1000 ? '#08306B' :
        d > 500 ? '#08519C' :
          d > 200 ? '#2171B5' :
            d > 100 ? '#4294C6' :
              d > 50 ? '#6BAED6' :
                d > 20 ? '#9ECAE1' :
                  d > 10 ? '#C6DBEF' :
                    '#DEEBF7';
    }

    function getColorDistrito(d) {
      return d > 1000 ? '#00441B' :
        d > 500 ? '#006D2C' :
          d > 200 ? '#238B45' :
            d > 100 ? '#41AB5D' :
              d > 50 ? '#74C476' :
                d > 20 ? '#A1D99B' :
                  d > 10 ? '#C7E9C0' :
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
