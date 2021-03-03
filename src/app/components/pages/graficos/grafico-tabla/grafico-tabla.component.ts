import { Component, OnInit } from '@angular/core';
import { DataTable } from 'src/app/models/dataTable';

@Component({
  selector: 'app-grafico-tabla',
  templateUrl: './grafico-tabla.component.html',
  styleUrls: ['./grafico-tabla.component.scss']
})
export class GraficoTablaComponent implements OnInit {

  dataTable: DataTable[];

  constructor() { }

  ngOnInit(): void {
  }

}
