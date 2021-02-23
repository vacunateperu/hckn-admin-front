import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HOST_BACKEND, HOST_GEOJSON } from '../shared/var.constant';

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


  getDepartamentosNombres(){
    return this.http.get(`${HOST_GEOJSON}/departamental.geojson`)
    .toPromise()
    .then(res => res['features'])
    .then(data => {
      return data.map(item =>({
        nombre: item.properties.NOMBDEP,
        id: item.properties.FIRST_IDDP
      }));
    });
  }

  getProvinciasNombresPorDepartamentoId(idDepartamento: string){
    return this.http.get(`${HOST_GEOJSON}/provincial.geojson`)
    .toPromise()
    .then(res => res['features'])
    .then(res => 
      {
       return res.filter(item => {
          return item.properties.FIRST_IDPR.startsWith(idDepartamento);
        })
      }
    )
    .then(data => {
      return data.map(item =>({
        nombre: item.properties.NOMBPROV,
        id: item.properties.FIRST_IDPR
      }));
    })
  } 

  getDistritosNombresPorProvinciaId(idProvincia: string){
    return this.http.get(`${HOST_GEOJSON}/distrital.geojson`)
    .toPromise()
    .then(res => res['features'])
    .then(res => {
       return res.filter(item => {
          return item.properties.IDDIST.startsWith(idProvincia);
        })
    })
    .then(data => {
      return data.map(item =>({
        nombre: item.properties.NOMBDIST,
        id: item.properties.IDDIST
      }));
    })
  }

  getRangoVulnerablesPorDistritoId(idDistrito: string){
    
  }

}
