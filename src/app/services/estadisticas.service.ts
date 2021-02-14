import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HOST_BACKEND } from '../shared/var.constant';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  url = HOST_BACKEND;

  constructor(private http: HttpClient) { }

  getPromediosDistritos(): Promise<any[]> {
    return this.http.get<any>(`${this.url}/promedio_distrito.json`)
    .toPromise()
    .then(res => <any[]>res.data)
    .then(data => { return data; });
  }

  getPromediosProvincias(){
    return this.http.get<any>(`${this.url}/promedio_provincia.json`)
    .toPromise()
    .then(res => <any[]>res.data)
    .then(data => { return data; });
  }

  getPromediosDepartamentos(): Promise<any[]>{
    return this.http.get<any>(`${this.url}/promedio_departamento.json`)
    .toPromise()
    .then(res => <any[]>res.data)
    .then(data => { return data; });
  }

  

}
