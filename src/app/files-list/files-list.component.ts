import { PlayerService } from "./../services/player.service";
import { DataService } from "./../services/data.service";
import { Component, OnInit } from '@angular/core';
import { IAnalyzedAudio } from "../interfaces/audio.interface";

@Component({
  selector: 'wm-files-list',
  templateUrl: './files-list.component.html',
  styleUrls: ['./files-list.component.less']
})
export class FilesListComponent implements OnInit {
  public files: IAnalyzedAudio[] = [];
  constructor(
    public dataService: DataService,
    private playerService: PlayerService
  ) { }

  ngOnInit() {
    this.files = this.dataService.files;
  }

  public playFile(index) {
    this.playerService.playAudio$.next(index);
  }

}
