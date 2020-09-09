import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlLoaderComponent } from './html-loader.component';

describe('HtmlLoaderComponent', () => {
  let component: HtmlLoaderComponent;
  let fixture: ComponentFixture<HtmlLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HtmlLoaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
