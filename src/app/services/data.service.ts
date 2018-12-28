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
  public itemAdded$: Subject<IAnalyzedAudio> = new Subject<IAnalyzedAudio>();
  public processingItemStarted$: Subject<IAnalyzedAudio> = new Subject<IAnalyzedAudio>();
  public processingItemStep$: Subject<IProcessingEvent> = new Subject<IProcessingEvent>();
  public processingItemFinished$: Subject<IAnalyzedAudio> = new Subject<IAnalyzedAudio>();

  // private vars
  private unprocessedFilesIndexes: number[] = [];
  private processedFilesIndexes: number[] = [];
  private processingFiles: boolean = false; // true if files are being analyzed
  private processingEnabled: boolean = true; // if true, then we can process files
  private nextFileToProcessTimeout: any;


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
    const now = (Date.now() as number);
    
      const prepared = {
        file: file,
        objectURL: null,
        waveform: null,
        bpm: null,
        tags: null,
        picture: null,
        complete: false,
        recentlyUploaded: true,
        uploadTimestamp: now
      }
      const position = this.files.push(prepared);
      this.unprocessedFilesIndexes.push(position - 1);
      this.itemAdded$.next(prepared);
      this.audioService.getMediaTags(file).then((tags) => {
      this.files[position - 1].tags = tags;
      // picture
      const image = this.files[position - 1].tags.tags.picture;
      if (image) {
        var base64String = "";
        for (var i = 0; i < image.data.length; i++) {
          base64String += String.fromCharCode(image.data[i]);
        }
        var base64 = "data:image/jpeg;base64," +
          window.btoa(base64String);
          this.files[position - 1].picture = base64;
      } else {
        this.files[position - 1].picture = null;
      }
        // this.processingItemStep$.next({ type: ProcessingSteps.TAGS_CREATED, payload: file } );
    });

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
      this.processingItemStarted$.next();
      if (this.unprocessedFilesIndexes.length > 0 && !this.processingFiles) {
        // autoload
        if (this.utilService.settings.upload.loadAfter) {
          this.playerService.loadAudio$.next(this.files[this.unprocessedFilesIndexes[0]]);
        }
        const file = await this.processFile(this.unprocessedFilesIndexes[0]);

        // autoplay
        if (this.utilService.settings.upload.playAfter) {
          this.playerService.playAudio$.next(file);
        }
      }
    }
  }

  public async stopProcessing() {
    this.processingEnabled = false;
    clearTimeout(this.nextFileToProcessTimeout);
  }

  public removeFile(index: number) {
    this.files.splice(index, 1);
  }

  // TODO Could may be improved for better performance
  public resetRecentlyUploaded() {
    this.files.forEach(element => {
      if (element.complete) { element.recentlyUploaded = false; }
    });
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
        console.log("before emit itemstep");
        this.processingItemStep$.next({ type: ProcessingSteps.FILE_CREATED, payload: file });

        // recently uploaded
        file.recentlyUploaded = true;

        // url
        file.objectURL = URL.createObjectURL(file.file);
        this.processingItemStep$.next({ type: ProcessingSteps.URL_CREATED, payload: file });

        // tags
        // file.tags = await this.audioService.getMediaTags(file.file);
        // this.processingItemStep$.next({ type: ProcessingSteps.TAGS_CREATED, payload: file });

        // // picture
        // const image = file.tags.tags.picture;
        // if (image) {
        //   var base64String = "";
        //   for (var i = 0; i < image.data.length; i++) {
        //     base64String += String.fromCharCode(image.data[i]);
        //   }
        //   var base64 = "data:image/jpeg;base64," +
        //     window.btoa(base64String);
        //   file.picture = base64;
        // } else {
        //   file.picture = null;
        // }
        console.log(file);

        // get arraybuffer first for further processing
        const arraybuffer = await this.audioService.getBuffer(file.objectURL);

        // waveform
        file.waveform = await this.audioService.createWaveformFromBuffer(arraybuffer);
        this.processingItemStep$.next({ type: ProcessingSteps.WAVEFORM_CREATED, payload: file });

        // bpm
        file.bpm = await this.audioService.createBPMFromBuffer(arraybuffer);
        this.processingItemStep$.next({ type: ProcessingSteps.BPM_CREATED, payload: file });

        file.complete = true;

        // remove first index && add completed index
        this.unprocessedFilesIndexes.shift();
        const myIndex = this.files.indexOf(file);
        this.processedFilesIndexes.push(myIndex);

        if (this.unprocessedFilesIndexes.length > 0 && this.processingEnabled) {
          if (this.utilService.settings.processing.delayBetweenFiles > 0) {
            this.nextFileToProcessTimeout = setTimeout(() => {
              this.processFile(this.unprocessedFilesIndexes[0]);
            }, this.utilService.settings.processing.delayBetweenFiles);
          } else {
            this.processFile(this.unprocessedFilesIndexes[0]);
          }
        } else {
          this.processingFiles = false;
        }
        resolve(this.files[indexOfFile]);

      }
    });

    
  }

  public resetFiles() {
    this.files = [];
    this.processedFilesIndexes = [];
    this.unprocessedFilesIndexes = [];
    clearTimeout(this.nextFileToProcessTimeout);
  }



}
