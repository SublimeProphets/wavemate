import { IAnalyzedAudio } from "./../interfaces/audio.interface";
import { AudioService } from "./audio.service";
import { UtilService } from "./util.service";
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';



@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private queuedFiles: File[] = [];
  // private isAnalyzing: boolean = false;
  // Observables
  public playAudio$: Subject<number> = new Subject<number>();
  public analyzingFinished$: Subject<IAnalyzedAudio> = new Subject<IAnalyzedAudio>();

  constructor(private sanitizer: DomSanitizer,
    private utilService: UtilService,
    private audioService: AudioService) { }

  
}
