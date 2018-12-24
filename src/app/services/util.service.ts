import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UtilService {
  public settings = {
    upload: {
      __icon: "cloud-upload",
      __label: "Upload",
      processAfterUpload: {
        label: "Process files after upload",
        value: true
      },
      loadAfter: {
        label: "Load new file into player",
        value: true
      },
      playAfter: {
        label: "Play file after upload",
        value: true
      }
    },
    processing: {
      delayBetweenFiles: 2000
    }
  }

  constructor() { }

  
}
