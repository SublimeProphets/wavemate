import { Component } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";


import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ["app.component.less"]
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private themeService: ThemeService,
    translate: TranslateService) {
      // this language will be used as a fallback when a translation isn't found in the current language
      translate.setDefaultLang('en-us');

       // the lang to use, if the lang isn't available, it will use the current loader to get them
      translate.use('en-us');
  
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.themeService.getTheme();
    });
  }
}
