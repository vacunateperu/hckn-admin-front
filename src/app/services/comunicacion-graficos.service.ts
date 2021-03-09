import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { Autocomplete } from '../models/autocomplete';

@Injectable({
  providedIn: 'root'
})
export class ComunicacionGraficosService {

  constructor() { }

  private lugarSeleccionadoSource = new Subject<any>();

  lugarSeleccionado = this.lugarSeleccionadoSource.asObservable();

  seleccionarLugar(idLugar: any){
    this.lugarSeleccionadoSource.next(idLugar);
  }


}
