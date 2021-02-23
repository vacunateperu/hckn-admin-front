import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-grafico-barra',
  templateUrl: './grafico-barra.component.html',
  styleUrls: ['./grafico-barra.component.scss']
})
export class GraficoBarraComponent implements OnInit {

  data: any;
  departamentos = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  promedios = [65, 59, 80, 81, 56, 55, 40];
  deptSeleccionado = 'ANCASH';
  

  constructor() {
    this.data = {
      labels: this.departamentos,
      datasets: [
          {
              label: this.deptSeleccionado,
              backgroundColor: '#42A5F5',
              borderColor: '#1E88E5',
              data: this.promedios
          }
      ]
  }
  }

  ngOnInit(): void {
  }

}
