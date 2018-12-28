import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

import { IAnalyzedAudio } from '../interfaces/audio.interface';
import { Subject, BehaviorSubject } from 'rxjs';


@Component({
  selector: 'wm-files-item',
  templateUrl: './files-item.component.html',
  styleUrls: ['./files-item.component.less'],
  animations: [
    trigger('openClose', [
      
      
      
      // ...
      state('open', style({
        height: '200px',
        opacity: 1,
        backgroundColor: 'yellow'
      })),
      state('closed', style({
        height: '100px',
        opacity: 0.5,
        backgroundColor: 'green'
      })),
      transition('open => closed', [
        animate('1s')
      ]),
      transition('initial => loaded', [
        animate('1s')
      ]),
      transition('closed => open', [
        animate('0.5s')
      ]),
    ]),
    trigger('fadeIn', [
      
      state("initial", style({
        opacity: 0,
        transform: "translateX(-100%)"
      })),
      state("loaded", style({
        opacity: 1,
        transform: "translateX(0)"
      })),
      // ...
      
      transition('initial => loaded', [
        animate('1.2s')
      ]),
    ]),
  ],
})
export class FilesItemComponent implements OnInit, AfterViewInit {
  @Input() public file: IAnalyzedAudio;
  public isLoaded: boolean = false;
  constructor() { }

  ngOnInit() {
    new BehaviorSubject<Boolean>(true).subscribe((res) => { this.isLoaded = true; });
  }
  ngAfterViewInit() {
    
  }

}
