import { FilesListComponent } from "./../files-list/files-list.component";
import { PeaksComponent } from "./../peaks/peaks.component";
import { ThemeSwitchComponent } from "./../theme-switch/theme-switch.component";
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';

import { PlayerComponent } from "../player/player.component";
import { UploaderComponent } from "../uploader/uploader.component";
import { WaveformComponent } from '../waveform/waveform.component';
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab1Page }])
  ],
  declarations: [
    Tab1Page, 
    PlayerComponent,
    UploaderComponent,
    WaveformComponent,
    ThemeSwitchComponent,
    PeaksComponent,
    FilesListComponent
  ]
})
export class Tab1PageModule {}
