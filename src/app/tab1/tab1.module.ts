
import { PeaksComponent } from "./../peaks/peaks.component";
import { ThemeSwitchComponent } from "./../theme-switch/theme-switch.component";
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';

// import { TranslateModule, TranslateCompiler, TranslateLoader } from "@ngx-translate/core";


import { PlayerComponent } from "../player/player.component";
import { UploaderComponent } from "../uploader/uploader.component";
import { WaveformComponent } from '../waveform/waveform.component';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { createTranslateLoader, SharedModule } from "../app.module";
import { HttpClient } from "@angular/common/http";
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab1Page }]),
  //   TranslateModule.forChild({
  //     loader: {provide: TranslateLoader, useClass: CustomLoader},
  //     compiler: {provide: TranslateCompiler, useClass: CustomCompiler},
  //     parser: {provide: TranslateParser, useClass: CustomParser},
  //     missingTranslationHandler: {provide: MissingTranslationHandler, useClass: CustomHandler},
  //     isolate: true
  // })
  // TranslateModule.forChild(),
  TranslateModule.forChild({
    loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
    }}),
    SharedModule
  ],
  declarations: [
    Tab1Page, 
    PlayerComponent,
    // UploaderComponent,
    // WaveformComponent,

    PeaksComponent,
    
  ]
})
export class Tab1PageModule {}
