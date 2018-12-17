import { HttpClientModule } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// services
import { PlayerService } from "./services/player.service";
import { UtilService } from "./services/util.service";
// import { SettingsComponent } from './settings/settings.component';
// import { FilesListComponent } from './files-list/files-list.component';
// import { PeaksComponent } from './peaks/peaks.component';
// import { ThemeSwitchComponent } from './theme-switch/theme-switch.component';



@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    PlayerService,
    UtilService
    
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
