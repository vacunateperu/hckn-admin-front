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
    return this.http.get<any>(`${this.url}/dist`)
    .toPromise()
    .then(res => <any[]>res.data)
    .then(data => { return data; });
  }

  getPromediosProvincias(){
    return this.http.get<any>(`${this.url}/prov`)
    .toPromise()
    .then(res => <any[]>res.data)
    .then(data => { return data; });
  }

  getPromediosDepartamentos(): Promise<any[]>{
    return this.http.get<any>(`${this.url}/dept`)
    .toPromise()
    .then(res => <any[]>res.data)
    .then(data => { return data; });
  }

  

}
