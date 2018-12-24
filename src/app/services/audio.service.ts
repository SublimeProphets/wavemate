import { IAnalyzedAudio } from "./../interfaces/audio.interface";
import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';

// 3rd party
import * as webAudioBuilder from "waveform-data/webaudio";
import * as jsmediatags from "jsmediatags/dist/jsmediatags.min";
import { reject } from "q";

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor(private http: HttpClient) { }


  /**
   * See https://www.npmjs.com/package/waveform-data "Using Web Audio" -> With AJAX
   * @param file 
   */
  // public createWaveformData(file): Promise<any> {
  //   return new Promise((resolve, reject) => {

  //     var xhr = new XMLHttpRequest();
  //     const audioContext = new AudioContext();
  //     // const webAudioBuilder = require('waveform-data/webaudio');
  //     xhr.open('GET', file);
  //     xhr.responseType = 'arraybuffer';
  //     xhr.addEventListener('load', (progressEvent) => {
  //       webAudioBuilder(audioContext, (progressEvent as any).target.response, (err, waveform) => {
  //         if (err) {
  //           console.error(err);
  //           reject(err);
  //         }
  //         resolve(waveform);
  //       });
  //     });

  //     xhr.send();

  //   });
  // }



  public async createWaveformFromBuffer(buffer: ArrayBuffer) {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext(); // needed?? can not be passed?
      webAudioBuilder(audioContext, buffer.slice(0), (err, waveform) => { // buffer.slice(0) to create copy instead of consuming the buffer
        if (err) {
          console.error(err);
          reject(err);
        }
        // for now we only need one part of the whole result
        const neededData = new Int8Array(waveform.adapter.data.buffer);
        resolve(neededData);
      });
    });
  }

  // public createBoth(objectURL) {
  //   return new Promise((resolve, reject) => {

  //     var request = new XMLHttpRequest();
  //     request.open('GET', objectURL, true);
  //     request.responseType = 'arraybuffer';
  //     request.onload = async () => {
  //       console.log(request.response);
  //       const wf = await this.createWaveformFromBuffer(request.response);
  //       const bpm = await this.createBPMFromBuffer(request.response);
  //       resolve({ wf: wf, bpm: bpm });
  //     };
  //     request.send();
  //   });

  // }


  /**
   * my angular version for requesting XHR 
   * does all the analyzing stuff in one call.
   * @param file like File
   */
  // public analyzeAll(file: File): Promise<IAnalyzedAudio> {
  //   return new Promise((resolve, reject) => {
  //     const objectURL = URL.createObjectURL(file);
      
  //     this.http.get(objectURL, {
  //       responseType: "arraybuffer"
  //     }).subscribe(async (buffer) => {
  //       const wf = await this.createWaveformFromBuffer(buffer);
        
  //       const bpm = await this.createBPMFromBuffer(buffer);
  //       const tags = await this.getMediaTags(file);  

  //       const finalData: IAnalyzedAudio = {
  //         file: file,
  //         objectURL: objectURL,
  //         waveform: wf,
  //         bpm: bpm,
  //         tags: tags,
  //         picture: null,
  //         complete: true
  //       }
  //       resolve(finalData);
  //     },
  //       (err) => {
  //         console.error(err);
  //         reject(err);
  //       })
  //   });
  // }



  /**
   * my angular version for requesting XHR 
   * does all the analyzing stuff in one call.
   * @param file like File
   */
  public getBuffer(objectURL: any): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      this.http.get(objectURL, {
        responseType: "arraybuffer"
      }).subscribe((buffer) => {
        resolve(buffer);
      },
        (err) => {
          console.error(err);
          reject(err);
        })
    });
  }

  /**
   * see https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js
   * modified to align typescript & angular
   */
  private getPeaks(data) {

    // What we're going to do here, is to divide up our audio into parts.

    // We will then identify, for each part, what the loudest sample is in that
    // part.

    // It's implied that that sample would represent the most likely 'beat'
    // within that part.

    // Each part is 0.5 seconds long - or 22,050 samples.

    // This will give us 60 'beats' - we will only take the loudest half of
    // those.

    // This will allow us to ignore breaks, and allow us to address tracks with
    // a BPM below 120.

    var partSize = 22050,
      parts = data[0].length / partSize,
      peaks = [];

    for (var i = 0; i < parts; i++) {
      let max: any = 0;
      for (var j = i * partSize; j < (i + 1) * partSize; j++) {
        var volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
        if (!max || (volume > max.volume)) {
          max = {
            position: j,
            volume: volume
          };
        }
      }
      peaks.push(max);
    }

    // We then sort the peaks according to volume...

    peaks.sort(function (a, b) {
      return b.volume - a.volume;
    });

    // ...take the loundest half of those...

    peaks = peaks.splice(0, peaks.length * 0.5);

    // ...and re-sort it back based on position.

    peaks.sort(function (a, b) {
      return a.position - b.position;
    });

    return peaks;
  }

  /**
   * see https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js
   * modified to align typescript & angular
   */
  private getIntervals(peaks) {

    // What we now do is get all of our peaks, and then measure the distance to
    // other peaks, to create intervals.  Then based on the distance between
    // those peaks (the distance of the intervals) we can calculate the BPM of
    // that particular interval.

    // The interval that is seen the most should have the BPM that corresponds
    // to the track itself.

    var groups = [];

    peaks.forEach(function (peak, index) {
      for (var i = 1; (index + i) < peaks.length && i < 10; i++) {
        var group = {
          tempo: (60 * 44100) / (peaks[index + i].position - peak.position),
          count: 1
        };

        while (group.tempo < 90) {
          group.tempo *= 2;
        }

        while (group.tempo > 180) {
          group.tempo /= 2;
        }

        group.tempo = Math.round(group.tempo);

        if (!(groups.some(function (interval) {
          return ((interval.tempo === group.tempo ? interval.count++ : 0) as any);
        }))) {
          groups.push(group);
        }
      }
    });
    return groups;
  }

  /**
   * see https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js
   * modified to align typescript & angular
   */
  public analyzeBPM(objectURL) {
    return new Promise((resolve, reject) => {

      var request = new XMLHttpRequest();
      request.open('GET', objectURL, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        // Create offline context
        var OfflineContext = OfflineAudioContext;
        var offlineContext = new OfflineContext(2, 30 * 44100, 44100);

        offlineContext.decodeAudioData(request.response, function (buffer) {

          // Create buffer source
          var source = offlineContext.createBufferSource();
          source.buffer = buffer;

          // Beats, or kicks, generally occur around the 100 to 150 hz range.
          // Below this is often the bassline.  So let's focus just on that.

          // First a lowpass to remove most of the song.

          var lowpass = offlineContext.createBiquadFilter();
          lowpass.type = "lowpass";
          lowpass.frequency.value = 150;
          lowpass.Q.value = 1;

          // Run the output of the source through the low pass.

          source.connect(lowpass);

          // Now a highpass to remove the bassline.

          var highpass = offlineContext.createBiquadFilter();
          highpass.type = "highpass";
          highpass.frequency.value = 100;
          highpass.Q.value = 1;

          // Run the output of the lowpass through the highpass.

          lowpass.connect(highpass);

          // Run the output of the highpass through our offline context.

          highpass.connect(offlineContext.destination);

          // Start the source, and render the output into the offline conext.

          source.start(0);
          offlineContext.startRendering();
        });

        offlineContext.oncomplete = (e) => {
          var buffer = e.renderedBuffer;
          var peaks = this.getPeaks([buffer.getChannelData(0), buffer.getChannelData(1)]);
          var groups = this.getIntervals(peaks);

          resolve({
            buffer: buffer,
            peaks: peaks,
            groups: groups
          });








          // var svg = document.querySelector('#svg');
          // svg.innerHTML = '';
          // var svgNS = 'http://www.w3.org/2000/svg';
          // var rect;
          // peaks.forEach(function (peak) {
          //   rect = document.createElementNS(svgNS, 'rect');
          //   rect.setAttributeNS(null, 'x', (100 * peak.position / buffer.length) + '%');
          //   rect.setAttributeNS(null, 'y', 0);
          //   rect.setAttributeNS(null, 'width', 1);
          //   rect.setAttributeNS(null, 'height', '100%');
          //   svg.appendChild(rect);
          // });

          // rect = document.createElementNS(svgNS, 'rect');
          // rect.setAttributeNS(null, 'id', 'progress');
          // rect.setAttributeNS(null, 'y', 0);
          // rect.setAttributeNS(null, 'width', 1);
          // rect.setAttributeNS(null, 'height', '100%');
          // svg.appendChild(rect);

          // svg.innerHTML = svg.innerHTML; // force repaint in some browsers

          // var top = groups.sort(function (intA, intB) {
          //   return intB.count - intA.count;
          // }).splice(0, 5);
          // let text = { innerHTML: "" };
          // text.innerHTML = '<div id="guess">Guess for track <strong>' + + '</strong> by ' +
          //   '<strong>' + + '</strong> is <strong>' + Math.round(top[0].tempo) + ' BPM</strong>' +
          //   ' with ' + top[0].count + ' samples.</div>';

          // text.innerHTML += '<div class="small">Other options are ' +
          //   top.slice(1).map(function (group) {
          //     return group.tempo + ' BPM (' + group.count + ')';
          //   }).join(', ') +
          //   '</div>';

          // resolve(text);
        };
      };
      request.send();
    })
  }


  public createBPMFromBuffer(buffer: ArrayBuffer) {
    return new Promise((resolve, reject) => {
      // Create offline context
      var OfflineContext = OfflineAudioContext;
      var offlineContext = new OfflineContext(2, 30 * 44100, 44100);

      offlineContext.decodeAudioData(buffer.slice(0), (buffer) => { // buffer.slice(0) to create copy instead of consuming original

        // Create buffer source
        var source = offlineContext.createBufferSource();
        source.buffer = buffer;

        // Beats, or kicks, generally occur around the 100 to 150 hz range.
        // Below this is often the bassline.  So let's focus just on that.

        // First a lowpass to remove most of the song.

        var lowpass = offlineContext.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 150;
        lowpass.Q.value = 1;

        // Run the output of the source through the low pass.

        source.connect(lowpass);

        // Now a highpass to remove the bassline.

        var highpass = offlineContext.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 100;
        highpass.Q.value = 1;

        // Run the output of the lowpass through the highpass.

        lowpass.connect(highpass);

        // Run the output of the highpass through our offline context.

        highpass.connect(offlineContext.destination);

        // Start the source, and render the output into the offline conext.

        source.start(0);
        offlineContext.startRendering();
      });

      offlineContext.oncomplete = (e) => {

        var buffer = e.renderedBuffer;
        var peaks = this.getPeaks([buffer.getChannelData(0), buffer.getChannelData(1)]);
        var groups = this.getIntervals(peaks);

        resolve({
          buffer: buffer,
          peaks: peaks,
          groups: groups
        });
      }
    });
  }

  /**
   * see https://github.com/aadsm/jsmediatags
   * @param file like File
   */
  public async getMediaTags(file: File) {
    return new Promise((resolve, reject) => {
      jsmediatags.read(file, {
        onSuccess: function (tag) {
          resolve(tag);
        },
        onError: function (error) {
          reject(error);
        }
      });
    });
  }





}
