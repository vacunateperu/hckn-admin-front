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
    this.leafletService.getDepartamentos().subscribe((json: any) => {

      /*
      for (var i = 0; i < json['features'].length; i++) {

        json['features'][i]['properties']['fill'] = '#00aa22'
        json['features'][i]['properties']['fill-opacity'] = 0.5
        json['features'][i]['properties']['stroke'] = '#00aa22'
        json['features'][i]['properties']['stroke-width'] = '#00aa22'
        json['features'][i]['properties']['stroke-opacity'] = '#00aa22'

        console.log(json['features'][i])
        
      }*/


      L.geoJSON(json, {
        style: function (feature) {
          return {
            fillColor: getColor(feature.properties.COUNT),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
          };
        }
      }).addTo(map);

      function getColor(d) {
        return d > 1000 ? '#800026' :
               d > 500  ? '#BD0026' :
               d > 200  ? '#E31A1C' :
               d > 100  ? '#FC4E2A' :
               d > 50   ? '#FD8D3C' :
               d > 20   ? '#FEB24C' :
               d > 10   ? '#FED976' :
                          '#FFEDA0';
    }


      map.setView([-9.89, -74.86], 6);

    });

  }







}
