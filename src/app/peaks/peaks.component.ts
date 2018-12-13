import { PlayerComponent } from "./../player/player.component";
import { Component, OnInit, ElementRef, Input, AfterViewInit, ViewChild, Host } from "@angular/core";

@Component({
  selector: 'wm-peaks',
  templateUrl: './peaks.component.html',
  styleUrls: ['./peaks.component.less']
})
export class PeaksComponent implements AfterViewInit {
  @Input("data") data: any;
  @ViewChild("svg") svg: any;
  private audioTag: any;
  constructor(
    private element: ElementRef,
    @Host() private host: PlayerComponent
    ) { }

  ngAfterViewInit() {
    this.render();
    this.host.durationChange$.subscribe((audioTag) => {
      console.log("in peak listen to currentTime");
      this.audioTag = audioTag;
      this.updateProgressState();
    })
  }

  /**
   * extracted and refactored from https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js
   */
  private render() {
    this.svg = this.svg.nativeElement;
    this.svg.innerHTML = '';
    const svgNS = 'http://www.w3.org/2000/svg';
    let rect;
    this.data.peaks.forEach((peak) => {
      rect = document.createElementNS(svgNS, 'rect');
      rect.setAttributeNS(null, 'x', (100 * peak.position / this.data.buffer.length) + '%');
      rect.setAttributeNS(null, 'y', 0);
      rect.setAttributeNS(null, 'width', 1);
      rect.setAttributeNS(null, 'height', '100%');
      this.svg.appendChild(rect);
    });

    rect = document.createElementNS(svgNS, 'rect');
    rect.setAttributeNS(null, 'class', 'progress');
    rect.setAttributeNS(null, 'y', 0);
    rect.setAttributeNS(null, 'width', 1);
    rect.setAttributeNS(null, 'height', '100%');
    this.svg.appendChild(rect);

    this.svg.innerHTML = this.svg.innerHTML; // force repaint in some browsers
  }

  private updateProgressState() {
    const progressIndicator = this.svg.querySelector('.progress');
    if (progressIndicator && this.audioTag.duration) {
      progressIndicator.setAttribute('x', (this.audioTag.currentTime * 100 / this.audioTag.duration) + '%');
    }
    // TODO did failed hard - why? works without...
    // requestAnimationFrame(this.updateProgressState);
  }

}
