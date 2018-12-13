import { DataService } from "./../services/data.service";
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { PlayerService } from "../services/player.service";
import { IAnalyzedAudio } from '../interfaces/audio.interface';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  private subscriptionCollection: Subscription[] = [];
  public file: IAnalyzedAudio;

  constructor(
    private playerService: PlayerService,
    private dataService: DataService
  ) { }
  ngOnInit() {

    // listen to playAudio
    this.subscriptionCollection.push(this.playerService.playAudio$.subscribe((index) => {
      this.file = this.dataService.files[index];
      console.log(index);
    }));
  }
}