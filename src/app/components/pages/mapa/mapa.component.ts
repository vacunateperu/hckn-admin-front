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
    
    var ZOOM_DEPARTAMENTO: number = 6;
    var ZOOM_PROVINCIA: number = 8;
    var ZOOM_DISTRITO: number = 10;

    var jsonDeparmento = null;
    var jsonProvincia = null;
    var jsonDistrito = null;

    this.leafletService.getDepartamentos().subscribe(data =>{
      jsonDeparmento=data;
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


    function cambioMapa(e) {
      var zoom = e.target._zoom;
      var jsonMapa = null;
      var idColorMapa = null;
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
      console.log(idColorMapa)

      L.geoJSON(jsonMapa, {
        style: function (feature) {
          return {
            fillColor: getColorMapa(feature.properties.COUNT,idColorMapa),
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
      return getColorDepartamento(param);
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
      return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
          d > 200 ? '#E31A1C' :
            d > 100 ? '#FC4E2A' :
              d > 50 ? '#FD8D3C' :
                d > 20 ? '#FEB24C' :
                  d > 10 ? '#FED976' :
                    '#FFEDA0';
    }

    function getColorDistrito(d) {
      return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
          d > 200 ? '#E31A1C' :
            d > 100 ? '#FC4E2A' :
              d > 50 ? '#FD8D3C' :
                d > 20 ? '#FEB24C' :
                  d > 10 ? '#FED976' :
                    '#FFEDA0';
    }

  }

  loadJsonDepartamentos(): any{
   
  }

  loadJsonProvincias(){
    return this.leafletService.getProvincias().subscribe();
  }

  loadJsonDistritos(){
    return this.leafletService.getDistritos().subscribe();
  }

  /*
       for (var i = 0; i < json['features'].length; i++) {
 
         json['features'][i]['properties']['fill'] = '#00aa22'
         json['features'][i]['properties']['fill-opacity'] = 0.5
         json['features'][i]['properties']['stroke'] = '#00aa22'
         json['features'][i]['properties']['stroke-width'] = '#00aa22'
         json['features'][i]['properties']['stroke-opacity'] = '#00aa22'
 
         console.log(json['features'][i])
         
       }*/



}
