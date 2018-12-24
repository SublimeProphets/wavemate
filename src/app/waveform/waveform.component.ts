import { Component, OnInit, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import * as d3 from "d3";

@Component({
  selector: 'wm-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.less']
})
export class WaveformComponent implements OnInit, OnChanges {
  @Input("data") public data: any;
  @ViewChild("canvas") canvas: any;
  public rendered = false;


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
    var maxSampleSize = 1000;
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
      this.rendered = true;
      var summary = this.summarizeFaster(this.data, 600);
      var multiplier = 1;
      var w = 100 / 600;
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
          return (isNaN(multiplier * (d[1] - d[0]))) ? 0 : multiplier * (d[1] - d[0]);
      });
    } else if ((!this.data || this.data === null) && this.rendered) {
      // remove old stuff
      d3.select(this.element.nativeElement).selectAll("svg").remove();
      this.rendered = false;
    }
  }
}
