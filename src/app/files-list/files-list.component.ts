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
  public currentLoadedFile: IAnalyzedAudio;
  public currentSortMethod: number = 0;
  public sortMethods: any[] = [
    {
      name: "recentlyUpdated",
      label: "LIST.SORT.RECENTLY_UPDATED"
    },
    {
      name: "filename",
      label: "LIST.SORT.FILENAME"
    },
  ]


  constructor(
    public dataService: DataService,
    private playerService: PlayerService,
  ) {}

  ngOnInit() {
    this.files = this.dataService.files;
    this.playerService.loadAudio$.subscribe((file: IAnalyzedAudio) => {
      this.currentLoadedFile = file;
    });
    // this.dataService.processingItemStarted$.subscribe((file) => {  
    //   // this.files = this.dataService.files.slice(0);
    //   console.log("ItemAdded$", file, this.files);
    //   this.sort();
    // },    (err) => { console.log(err)})
    // this.dataService.processingItemStep$.subscribe((file) => {  
    //   // this.files = this.dataService.files.slice(0);
    //   console.log("processingItemStep", file, this.files);
    //   this.sort();
    // },    (err) => { console.log(err)})
  }

  public playFile(index) {
    if (this.dataService.files[index].objectURL) {
      this.playerService.loadAudio$.next(this.dataService.files[index]);
    }
  }

  public removeFile(index: number) {
    this.dataService.removeFile(index);
  }

  public sort(indexOfSortMethod?: number) {
    indexOfSortMethod = (typeof indexOfSortMethod === "undefined") ? this.currentSortMethod : indexOfSortMethod;
    const sortName: string = this.sortMethods[indexOfSortMethod].name;
    switch (sortName) {
      case "recentlyUpdated":
        this.files.sort(function (a, b) {
          if (a.uploadTimeStamp > b.uploadTimeStamp)
            return -1;
          if (a.uploadTimeStamp < b.uploadTimeStamp)
            return 1;
          return 0;
        });
        break;
      // case "recentlyUpdated":
      //   this.files.sort(function (a, b) {
      //     return (a.recentlyUploaded === b.recentlyUploaded) ? 0 : a ? -1 : 1;
      //   });
      //   break;
      case "filename":
        this.files.sort(function (a, b) {
          if (a.file.name < b.file.name)
            return -1;
          if (a.file.name > b.file.name)
            return 1;
          return 0;
        });
        break;
    }

    console.log("sort finished", sortName, this.files);
  }

}
