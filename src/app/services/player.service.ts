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
  
  // Observables
  public loadAudio$: Subject<IAnalyzedAudio> = new Subject<IAnalyzedAudio>();
  public pauseAudio$: Subject<IAnalyzedAudio> = new Subject<IAnalyzedAudio>();
  public playAudio$: Subject<IAnalyzedAudio> = new Subject<IAnalyzedAudio>();

  constructor(private sanitizer: DomSanitizer,
    private utilService: UtilService,
    private audioService: AudioService) { }

  
}
