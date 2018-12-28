// angular
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// ionic
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';


//3rd party
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
// own component etc
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// services
import { PlayerService } from "./services/player.service";
import { UtilService } from "./services/util.service";
// import { SettingsComponent } from './settings/settings.component';
import { FilesListComponent } from './files-list/files-list.component';
import { SearchPipe } from "./pipes/search.pipe";
import { CommonModule } from "@angular/common";
import { UploaderComponent } from "./uploader/uploader.component";
import { WaveformComponent } from "./waveform/waveform.component";
import { ArraySortPipe } from "./pipes/sort.pipe";
import { FilterPipe } from "./pipes/filter.pipe";
import { FilesItemComponent } from './files-item/files-item.component';
// import { PeaksComponent } from './peaks/peaks.component';
// import { ThemeSwitchComponent } from './theme-switch/theme-switch.component';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    WaveformComponent,
    SearchPipe,
    ArraySortPipe,
    FilterPipe
  ],
  exports: [
      CommonModule,
      WaveformComponent,
      SearchPipe,
      ArraySortPipe,
      FilterPipe
  ],
  providers: [
   
  ]
})
export class SharedModule { }

@NgModule({
  declarations: [
    AppComponent,
    FilesListComponent,
    FilesItemComponent,
    UploaderComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    SharedModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // PlayerService,
    // UtilService
    PlayerService,
    UtilService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
