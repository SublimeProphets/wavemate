import { UtilService } from "./../services/util.service";
import { AudioAPIWrapper } from "./../3rd/audio-api-wrapper";
import { PlayerService } from "../services/player.service";
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, ElementRef, OnChanges } from '@angular/core';
import { Subscription, Subject } from "rxjs";
import { IAnalyzedAudio } from "../interfaces/audio.interface";
import * as d3 from "d3";
import * as WaveformData from "waveform-data";

declare var AudioContext: any;
declare var webkitAudioContext: any;

@Component({
  selector: 'wm-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy, OnChanges {
  // public
  @ViewChild("audioRef") private audioRef: any;
  @Input("file") public file: IAnalyzedAudio;
  public audiobuffer: any;
  public currentTime: any = "n/a";
  public finished: boolean = false;

  public durationChange$: Subject<any> = new Subject();
  // private
  private subscriptionCollection: Subscription[] = [];

  private _audio: any;
  private _audioSrc: any;
  _analyser: any;
  _audioCtx = new (AudioContext || webkitAudioContext)();
  _svg: any;


  constructor(
    private playerService: PlayerService,
    private utilService: UtilService,
    private element: ElementRef
  ) { }
  // constructor() { }

  ngOnInit() {
    this.configurePlayer();

    // this keeps the player updated if initialized without all anaylzed data
    this.subscriptionCollection.push(this.playerService.analyzingFinished$.subscribe((update: IAnalyzedAudio) => {
      if (this.file.file === update.file) {
        this.file = update;
        this.playAudio();
        this.Visualize();
        console.log(this.file);
        if (this.file.waveform !== null && this.file.waveform.hasOwnProperty("adapter")) {
          this.audiobuffer = new Int8Array(this.file.waveform.adapter.data.buffer);
        } 
        
      }
    }));
  }

  ngOnChanges() {
    this.configurePlayer();
    this.playAudio();
  }

  ngOnDestroy() {
    this.subscriptionCollection.forEach(subscription => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        // do nothing
      }
    });
  }

  /**
   * does all the initial settings for the player
   * creates the reference to the nativeElement
   */
  private configurePlayer() {
    if (!this._audio) {
      this._audio = this.audioRef.nativeElement;
      this._audio.autoplay = false;
      this._audio.preload = 'auto';
      this._audio.autobuffer = true;
      this._audio.controls = true;
    }

    if (!this._audioSrc) {
      this._audioSrc = this._audioCtx.createMediaElementSource(this._audio);
    }

    if (!this._analyser && this._audioSrc.connect) {
      // Bind our analyser to the media element source.            
      this._analyser = this._audioCtx.createAnalyser();
      this._audioSrc.connect(this._analyser);
      this._audioSrc.connect(this._audioCtx.destination);
    }

    // this.audioRef.autoplay = true;
    this._audio.addEventListener("progress", () => {
      console.log("audio in progress");
    });
    this._audio.addEventListener("timeupdate", () => {
      this.currentTime = this._audio.currentTime;
      this.durationChange$.next(this._audio);
    });

    this.currentTime = this._audio.currentTime;

  }

  public playOrPause() {
    if (this._audio.paused) {
      this._audio.play();
    } else {
      this._audio.pause();
    }
  }


  /**
   * called by subscription onto playerService.playAudio$
   * @param uploadedFile like IUploadedFile 
   */
  private async playAudio() {
    this.configurePlayer();
    this._audio.pause();
    this._audio.src = this.file.objectURL;
    this._audio.load();
  }

  // private drawWaveform(raw_data) {
  //   console.log(WaveformData);
  //   const waveform = WaveformData.create(raw_data);
  //   var svgHeight = 100;
  //   var svgWidth = 1200;


  //   // const layout = d3.select(this).select('svg');
  //   const layout = d3.select("#waveform").append('svg').attr('height', svgHeight).attr('width', svgWidth);;
  //   const x = d3.scaleLinear();
  //   const y = d3.scaleLinear();
  //   const offsetX = 100;

  //   x.domain([0, waveform.adapter.length]).rangeRound([0, 1024]);
  //   y.domain([d3.min(waveform.min), d3.max(waveform.max)]).rangeRound([offsetX, -offsetX]);

  //   var area = d3.area()
  //     .x((d, i) => x(i))
  //     .y0((d, i) => y(waveform.min[i]))
  //     .y1((d, i) => y(d));

  //   layout.select('path')
  //     .datum(waveform.max)
  //     .attr('transform', () => `translate(0, ${offsetX})`)
  //     .attr('d', area);
  // }




  Visualize() {
    var self = this;

    var frequencyData = new Uint8Array(200);
    var svgHeight = 100;
    var svgWidth = 600;
    var barPadding = 1;
    function createSvg(parent, height, width) {
      return d3.select(parent).append('svg').attr('height', height).attr('width', width);
    }
    console.log(self);
    if (!self._svg) {
      // TODO DO this better

      self._svg = createSvg(this.element.nativeElement, svgHeight, svgWidth);
    }
    // Create our initial D3 chart.
    self._svg.selectAll('rect')
      .data(frequencyData)
      .enter()
      .append('rect')
      .attr('x', function (d, i) { return i * (svgWidth / frequencyData.length); })
      .attr('width', svgWidth / frequencyData.length - barPadding);
    // Continuously loop and update chart with frequency data.
    function renderChart() {
      requestAnimationFrame(renderChart);
      // Copy frequency data to frequencyData array.
      if (self._analyser) {
        self._analyser.getByteFrequencyData(frequencyData);
        // Update d3 chart with new data.
        self._svg.selectAll('rect')
          .data(frequencyData)
          .attr('y', function (d) { return svgHeight - d; })
          .attr('height', function (d) { return d; })
          .attr('fill', function (d) { return 'rgb(0, 0, ' + d + ')'; });
      }

    }
    // Run the loop
    renderChart();
  }


  // setDuration(load_event): void {
  //   console.log(Math.round(load_event.currentTarget.duration));
  // }



}
