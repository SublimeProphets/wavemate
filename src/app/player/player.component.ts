import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'wm-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  public source:string = "../../../assets/audio/alarm.wav";
  constructor() { }

  ngOnInit() {
    // this.playAudio();
  }
  playAudio(){
    let audio = new Audio();
    audio.src = "../../../assets/audio/alarm.wav";
    audio.load();
    audio.play();
  }
  

}
