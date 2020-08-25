import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivityManagerComponent } from './inactivity-manager.component';

describe('InactivityManagerComponent', () => {
  let component: InactivityManagerComponent;
  let fixture: ComponentFixture<InactivityManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InactivityManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InactivityManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
