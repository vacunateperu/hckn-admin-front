import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HOST_GEOJSON } from '../shared/var.constant';

@Injectable({
  providedIn: 'root'
})
export class LeafletService {

  constructor(private http: HttpClient) { }

  getDistritos() {
     return this.http.get(`${HOST_GEOJSON}/distrital.geojson`);
  }

  getProvincias() {
    return this.http.get(`${HOST_GEOJSON}/provincial.geojson`);
  }

  getDepartamentos() {
    return this.http.get(`${HOST_GEOJSON}/departamental.geojson`);
  }


}
