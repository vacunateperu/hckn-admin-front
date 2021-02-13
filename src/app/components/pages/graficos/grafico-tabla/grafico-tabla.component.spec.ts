import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoTablaComponent } from './grafico-tabla.component';

describe('GraficoTablaComponent', () => {
  let component: GraficoTablaComponent;
  let fixture: ComponentFixture<GraficoTablaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraficoTablaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GraficoTablaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
