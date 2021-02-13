import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LeafletService {

  constructor(private http: HttpClient) { }

  urlData= '/assets/data';

  getDistritos() {
     return this.http.get(`${this.urlData}/distrital.geojson`);
  }

  getProvincias() {
    return this.http.get(`${this.urlData}/provincial.geojson`);
  }

  getDepartamentos() {
    return this.http.get(`${this.urlData}/departamental.geojson`);
  }


}
