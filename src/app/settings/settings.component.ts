import { UtilService } from "./../services/util.service";
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'wm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})
export class SettingsComponent implements OnInit {
  public settings: any[] = [];
  constructor(public utilService: UtilService) { }

  ngOnInit() {
    this.processSettings();
  }


  private processSettings() {
    for(let key in this.utilService.settings) {
      console.log(key);
      const settingsBlock = this.utilService.settings[key];

      const result = {
        name: key,
        label: settingsBlock.__label,
        icon: settingsBlock.__icon,
        items: []
      }

      for(let keyItem in settingsBlock) {
        if(keyItem !== "__label" && keyItem !== "__icon") {
          const setting = settingsBlock[keyItem];
          setting.name = keyItem;
          result.items.push(setting)
        }
      }
      console.log(result);
      this.settings.push(result);
    }
  }

  public changeSetting(event: any, settingsBlock, setting) {
    this.utilService.settings[settingsBlock.name][setting.name].value = event.target.checked;
  }

}
