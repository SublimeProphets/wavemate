import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesItemComponent } from './files-item.component';

describe('FilesItemComponent', () => {
  let component: FilesItemComponent;
  let fixture: ComponentFixture<FilesItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
