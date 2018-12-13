import { PlayerService } from "./player.service";
import { AudioService } from "./audio.service";
import { Injectable } from '@angular/core';
import { IAnalyzedAudio } from '../interfaces/audio.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public files: IAnalyzedAudio[] = [];
  private unprocessedFilesIndexes: number[] = [];
  private processingFiles: boolean = false; // true if files are being analyzed

  constructor(
    private audioService: AudioService,
    private playerService: PlayerService
  ) { }

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
  }

  public async startQueue() {
    if (this.unprocessedFilesIndexes.length > 0 && !this.processingFiles) {
      this.playerService.playAudio$.next(this.unprocessedFilesIndexes[0]);
      const processedFile: IAnalyzedAudio = await this.processFile(this.unprocessedFilesIndexes[0]);
    }
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
        // vars
        const file = this.files[indexOfFile];
        const buffer = await this.audioService.getBuffer(this.files[indexOfFile].file);
        
        // tags
        file.tags = await this.audioService.getMediaTags(file.file);
        this.playerService.analyzingFinished$.next(file);
        file.waveform = await this.audioService.createWaveformFromBuffer(buffer);
        this.playerService.analyzingFinished$.next(file);
        file.bpm = await this.audioService.createBPMFromBuffer(buffer);
        this.playerService.analyzingFinished$.next(file);

        // this.playerService.analyzingFinished$.next(analyzedAudio);
        this.unprocessedFilesIndexes.shift(); // remove first index
        if (this.unprocessedFilesIndexes.length > 0) {
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
    //         this.playerService.analyzingFinished$.next(analyzedAudio);
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
