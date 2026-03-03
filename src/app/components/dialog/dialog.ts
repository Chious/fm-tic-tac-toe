import { Component } from '@angular/core';
import { Button } from '../button/button';
import iconO from '@assets/icon-o.svg';

@Component({
  selector: 'app-dialog',
  imports: [Button],
  templateUrl: './dialog.html',
})
export class Dialog {
  // TODO: Using props to deliver customize content;
  iconO = iconO;
}
