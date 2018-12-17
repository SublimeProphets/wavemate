import { UtilService } from "./util.service";
import { PlayerService } from "./player.service";
import { AudioService } from "./audio.service";
import { Injectable } from '@angular/core';
import { IAnalyzedAudio, IProcessingEvent, ProcessingSteps } from '../interfaces/audio.interface';
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // public vars
  public files: IAnalyzedAudio[] = [];

  // observables
  public processingItemStarted$: Subject<IAnalyzedAudio> = new Subject<IAnalyzedAudio>();
  public processingItemStep$: Subject<IProcessingEvent> = new Subject<IProcessingEvent>();
  public processingItemFinished$: Subject<IAnalyzedAudio> = new Subject<IAnalyzedAudio>();

  // private vars
  private unprocessedFilesIndexes: number[] = [];
  private processingFiles: boolean = false; // true if files are being analyzed
  private processingEnabled: boolean = true; // if true, then we can process files

  constructor(
    private audioService: AudioService,
    private playerService: PlayerService,
    private utilService: UtilService
  ) {
    // take settings
    this.processingEnabled = this.utilService.settings.upload.processAfterUpload.value;
  }

  public addFile(file: File) {
    // prepare file to match interface
    const prepared = {
      file: file,
      objectURL: null,
      waveform: null,
      bpm: null,
      tags: null,
      complete: false
    }
    const position = this.files.push(prepared);
    this.unprocessedFilesIndexes.push(position - 1);
    
    // autoload
    if(this.utilService.settings.upload.loadAfter) {
        this.playerService.loadAudio$.next(this.files[position - 1]);
    }

    // autoplay located in player.component.ts
  }

  /**
   * can be used after fileuploads or calling from FE or similar
   * @param force if force true, it does not respect the processingEnabled boolean
   * @status ok but not reviewed
   */
  public async startProcessing(force?: boolean) {
    if (this.processingEnabled || (force && !this.processingEnabled)) {
      this.processingEnabled = true; // if forced then we set enabled
      if (this.unprocessedFilesIndexes.length > 0 && !this.processingFiles) {
        this.processFile(this.unprocessedFilesIndexes[0]);
      }
    }
  }

  public async stopProcessing() {
    this.processingEnabled = false;
  }

  /**
   * 
   * @param indexOfFile index of this.files[] to process
   */
  private processFile(indexOfFile): Promise<IAnalyzedAudio> {
    return new Promise(async (resolve, reject) => {
      this.processingFiles = true;
      // not completed yet?
      if (!this.files[indexOfFile].complete) {
        
        // file itself
        const file = this.files[indexOfFile];
        this.processingItemStep$.next({ type: ProcessingSteps.FILE_CREATED, payload: file});

        // url
        file.objectURL = URL.createObjectURL(file.file);
        this.processingItemStep$.next({ type: ProcessingSteps.URL_CREATED, payload: file});

        // tags
        file.tags = await this.audioService.getMediaTags(file.file);
        this.processingItemStep$.next({ type: ProcessingSteps.TAGS_CREATED, payload: file});

        // get arraybuffer first for further processing
        const arraybuffer = await this.audioService.getBuffer(file.objectURL);

        // waveform
        file.waveform = await this.audioService.createWaveformFromBuffer(arraybuffer);
        this.processingItemStep$.next({ type: ProcessingSteps.WAVEFORM_CREATED, payload: file});
        
        // bpm
        file.bpm = await this.audioService.createBPMFromBuffer(arraybuffer);
        this.processingItemStep$.next({ type: ProcessingSteps.BPM_CREATED, payload: file});

        // remove first index
        this.unprocessedFilesIndexes.shift();
        if (this.unprocessedFilesIndexes.length > 0 && this.processingEnabled) {
          this.processFile(this.unprocessedFilesIndexes[0])
        } else {
          this.processingFiles = false;
        }
        resolve(this.files[indexOfFile]);

      }
    });
    // /**
    //  * 
    //  * @param indexOfFile index of this.files[] to process
    //  */
    // private processFile(indexOfFile): Promise<IAnalyzedAudio> {
    //   return new Promise((resolve, reject) => {
    //     this.processingFiles = true;
    //     // not completed yet?
    //     if (!this.files[indexOfFile].complete) {
    //       this.audioService.analyzeAll(this.files[indexOfFile].file).then((analyzedAudio) => {
    //         this.files[indexOfFile] = analyzedAudio;
    //         this.playerService.processingItemStepFinished$.next(analyzedAudio);
    //         this.unprocessedFilesIndexes.shift(); // remove first index
    //         if (this.unprocessedFilesIndexes.length > 0) {
    //           this.processFile(this.unprocessedFilesIndexes[0])
    //         } else {
    //           this.processingFiles = false;
    //         }
    //         resolve(this.files[indexOfFile]);
    //       });
    //     }
    //   });
  }



}
