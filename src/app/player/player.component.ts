import { ProcessingSteps } from "./../interfaces/audio.interface";
import { DataService } from "./../services/data.service";
import { UtilService } from "./../services/util.service";
import { AudioAPIWrapper } from "./../3rd/audio-api-wrapper";
import { PlayerService } from "../services/player.service";
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, ElementRef, OnChanges } from '@angular/core';
import { Subscription, Subject } from "rxjs";
import { IAnalyzedAudio, IProcessingEvent } from "../interfaces/audio.interface";
import * as d3 from "d3";
import * as WaveformData from "waveform-data";

declare var AudioContext: any;
declare var webkitAudioContext: any;

@Component({
  selector: 'wm-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class PlayerComponent implements OnInit, OnDestroy, OnChanges {
  // public
  @ViewChild("audioRef") private audioRef: any;
  public file: IAnalyzedAudio = {
    file: undefined,
    objectURL: false,
    waveform: false,
    bpm: false,
    tags: false,
    picture: false,
    complete: false,
    uploadTimeStamp: 0
  };
  public waveform: any;
  public currentTime: any = "n/a";
  public currentTimePercentage: number = 0;
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
    private dataService: DataService,
    private element: ElementRef
  ) { }
  // constructor() { }

  ngOnInit() {


    this.configurePlayer();
    this.subscriptionCollection.push(this.playerService.loadAudio$.subscribe((item) => {
      this.file = item;
      if (this.file.complete) {
        this.initializeAll();
      }
    }));

    this.subscriptionCollection.push(this.playerService.pauseAudio$.subscribe((item) => {
      this.pauseAudio();
    }));

    // listen to playAudio
    this.subscriptionCollection.push(this.playerService.playAudio$.subscribe((item) => {
      if (this.file.file === item.file) {
        this.playAudio();
      }
    }));

    // this keeps the player updated if initialized without all anaylzed data
    this.subscriptionCollection.push(this.dataService.processingItemStep$.subscribe((event: IProcessingEvent) => {
      // todo better check if same? could be performanter i guess but not checked
      if (!this.file.complete && this.file.file === event.payload.file) {
        switch (event.type) {
          case ProcessingSteps.URL_CREATED:
            this.file.objectURL = event.payload.objectURL;
            this.initAudio();
            if (this.utilService.settings.upload.playAfter.value) { this.playAudio(); }
            this.Visualize();
            break;
          case ProcessingSteps.WAVEFORM_CREATED:
            this.file.waveform = event.payload.waveform;
            break;
          case ProcessingSteps.BPM_CREATED:
            this.file.bpm = event.payload.bpm
            break;
          case ProcessingSteps.TAGS_CREATED:
            this.file.tags = event.payload.tags;
            break;
        }
      }
    }));
  }

  public setCurrentTime(newTime: number) {
    console.log(newTime);
    this.audioRef.nativeElement.pause();
    if(this.audioRef) this.audioRef.nativeElement.currentTime = Math.round(this.audioRef.nativeElement.duration / 100 * newTime);
    this.audioRef.nativeElement.play();
    this.currentTime = this.audioRef.nativeElement.currentTime;
    this.currentTimePercentage = 100 /  this._audio.duration * this.currentTime;
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

  private initializeAll() {
    this.initAudio();
    this.Visualize();
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
      // console.log("audio in progress");
    });
    this._audio.addEventListener("timeupdate", () => {
      this.currentTime = this._audio.currentTime;
      this.currentTimePercentage = 100 /  this._audio.duration * this.currentTime;
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
  private initAudio() {
    this._audio.pause();
    this._audio.src = this.file.objectURL;
    this._audio.load();
  }

  private playAudio() {
    this._audio.play();
  }

  private pauseAudio() {
    this._audio.pause();
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
