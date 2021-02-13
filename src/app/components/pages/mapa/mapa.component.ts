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
    this.leafletService.getDepartamentos().subscribe((json:any)=>{

      for (var i = 0; i < json['features'].length; i++) {

        json['features'][i]['properties']['fill'] = '#00aa22'
        json['features'][i]['properties']['fill-opacity'] = 0.5

        console.log(json['features'][i])
        
      }
     
      L.geoJSON(json).addTo(map);
    });
  
  }


}
