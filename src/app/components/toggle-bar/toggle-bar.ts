import { Component, signal, output } from '@angular/core';
import iconO from '@assets/icon-o.svg';
import iconX from '@assets/icon-x.svg';

type Mark = 'X' | 'O';

@Component({
  selector: 'app-toggle-bar',
  imports: [],
  templateUrl: './toggle-bar.html',
})
export class ToggleBar {
  iconO = iconO;
  iconX = iconX;

  selectedMark = signal<Mark>('X');

  markSelected = output<Mark>();

  selectMark(mark: Mark) {
    this.selectedMark.set(mark);
    this.markSelected.emit(mark);
  }
}
