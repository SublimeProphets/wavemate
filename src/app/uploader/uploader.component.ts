import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from "../services/data.service";

@Component({
  selector: 'wm-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.less']
})
export class UploaderComponent implements OnInit {
  public file: File;
  @ViewChild("dom_audio") dom_audio: any;
  public overDropZone: boolean = false;
  public fileDropped: boolean = false;
  public wrongFormat: boolean = false;
  constructor(
    private dataService: DataService
    ) { }

  ngOnInit() {
  }

  // At the drag drop area
  // (drop)="onDropFile($event)"
  onDropFile(event: DragEvent) {
    try {
      event.preventDefault();
      this.fileDropped = true;
      this.setFile(event.dataTransfer.files);
    } catch (e) {
      console.error(e);
    }
  }

  // At the drag drop area
  // (dragover)="onDragOverFile($event)"
  onDragOverFile(event) {
    try {
      event.stopPropagation();
      event.preventDefault();
      this.overDropZone = true;
    } catch (e) {
      console.error(e);
    }
  }
  onDragLeave(event) {
    try {
      event.stopPropagation();
      event.preventDefault();
      this.overDropZone = false;
    } catch (e) {
      console.error(e);
    }
  }


  setFile(files: any) {
    console.log(files);
    const add = (element) => {
      if (element.name.match(/\.(avi|mp3|mp4|mpeg|ogg)$/i)) {
        console.log("queueAudio", element);
        this.dataService.addFile(element);
      } else {
        this.wrongFormat = true;
      }
    }

    if (files.length > 0) {
      for (let element of files) {
        add(element);
      };
    } else {
      this.file = files[0];
      if (!this.file.name.match(/\.(avi|mp3|mp4|mpeg|ogg)$/i)) {
        this.wrongFormat = true;
      }
    }
    console.log("before startProcessing");
    this.dataService.startProcessing();
  }
  public setFileUrl(url: string) {
    if (url.match(/\.(avi|mp3|mp4|mpeg|ogg)$/i)) {
      fetch(url, {
        mode: "cors"
      })
        .then(res => res.blob()) // Gets the response and returns it as a blob
        .then(blob => {
          // Here's where you get access to the blob
          // And you can use it for whatever you want
          // Like calling ref().put(blob)

          const file = new File([blob], "name")
          console.log(file);
          // Here, I use it to make an image appear on the page
          // let objectURL = URL.createObjectURL(blob);
          this.dataService.addFile(file);
          this.dataService.startProcessing();

        });
    }
  }
}

