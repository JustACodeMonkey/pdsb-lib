import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintManagerComponent } from './print-manager.component';

describe('PrintManagerComponent', () => {
  let component: PrintManagerComponent;
  let fixture: ComponentFixture<PrintManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
