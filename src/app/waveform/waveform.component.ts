import { Component, OnInit, Input, OnChanges, ViewChild, ElementRef, HostListener, Output, EventEmitter, HostBinding } from '@angular/core';
import * as d3 from "d3";
import { TweenMax, Power2, Back } from "gsap/TweenMax";



@Component({
  selector: 'wm-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.less']
})
export class WaveformComponent implements OnInit, OnChanges {
  @Input("data") public data: any;
  @Input() public resolution: number = 1;
  @Input() public currentTime: number = 0;
  @Output() public onClick: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild("canvas") canvas: any;
  public rendered = false;
  public indicatorPos:number = 0;
  @HostBinding("class.showIndicator") public showIndicator: boolean = false;

  constructor(private element: ElementRef) { }

  ngOnInit() {
    this.renderSVG();
  }

  ngOnChanges() {
    this.renderSVG();
  }

  private summarizeFaster(data, pixels) {
    var pixelLength = Math.round(data.length / pixels);
    var vals = [];

    // Define a minimum sample size per pixel
    var maxSampleSize = 1000 * this.resolution;
    var sampleSize = Math.min(pixelLength, maxSampleSize);


    // For each pixel we display
    for (var i = 0; i < pixels; i++) {
      var posSum = 0,
        negSum = 0;

      // Cycle through the data-points relevant to the pixel
      // Don't cycle through more than sampleSize frames per pixel.
      for (var j = 0; j < sampleSize; j++) {
        var val = data[i * pixelLength + j];

        // Keep track of positive and negative values separately
        if (val > 0) {
          posSum += val;
        } else {
          negSum += val;
        }
      }
      vals.push([negSum / sampleSize, posSum / sampleSize]);
    }
    return vals;
  }

  private renderSVG() {
    if (this.data && !this.rendered) {
      const componentWidth = this.element.nativeElement.offsetWidth * this.resolution;
      const componentHeight = this.element.nativeElement.offsetWidth * this.resolution;
      this.rendered = true;
      var summary = this.summarizeFaster(this.data, componentWidth);
      var multiplier = 1;
      var w = 100 / componentWidth;
      d3.select(this.element.nativeElement)
        .append('svg')
        .attr('width', "100%")
        .attr('height', "100%")
        .selectAll('circle')
        .data(summary)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
          return (i * w) + "%";
        })
        .attr('y', function (d, i) {
          return 50 - (multiplier * d[1]);
        })
        .attr('width', w + "%")
        .attr('height', function (d) {
          return ((isNaN(multiplier * (d[1] - d[0]))) ? 0 : multiplier * (d[1] - d[0])) + "%";
        });
    } else if ((!this.data || this.data === null) && this.rendered) {
      // remove old stuff
      d3.select(this.element.nativeElement).selectAll("svg").remove();
      this.rendered = false;
    }
  }
  
  @HostListener('mousemove', ['$event'])
  onMouseMove(e) {
    if (e.layerX > 2) { this.indicatorPos = e.layerX; }
    console.log(this.indicatorPos);
  }

  @HostListener('mouseover', ['$event'])
  onMouseOver(e) {
    this.showIndicator = true;
  }
  @HostListener('mouseout', ['$event'])
  onMouseOut(e) {
    this.showIndicator = false;
  }
  @HostListener('click', ['$event'])
  onClickFn(e) {
    console.log(e.layerX);
    this.onClick.emit(100 / this.element.nativeElement.offsetWidth * this.indicatorPos);
  }
}
