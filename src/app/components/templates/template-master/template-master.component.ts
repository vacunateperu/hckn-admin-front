import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-template-master',
  templateUrl: './template-master.component.html',
  styleUrls: ['./template-master.component.scss']
})
export class TemplateMasterComponent implements OnInit {

  selected: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
