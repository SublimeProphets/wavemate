import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeaksComponent } from './peaks.component';

describe('PeaksComponent', () => {
  let component: PeaksComponent;
  let fixture: ComponentFixture<PeaksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeaksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeaksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
