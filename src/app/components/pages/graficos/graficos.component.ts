import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.scss']
})
export class GraficosComponent implements OnInit {

  text: string;
  results: string[];


  constructor() { }

  ngOnInit(): void {
  }

  search(event) {
    
  }

}
