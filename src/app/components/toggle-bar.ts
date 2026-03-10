import { Component, signal, output } from '@angular/core';
import iconO from '@assets/icon-o.svg';
import iconX from '@assets/icon-x.svg';

type Mark = 'X' | 'O';

@Component({
  selector: 'app-toggle-bar',
  imports: [],
  template: `
    <div class="bg-slate-900 p-4 rounded-md flex gap-4">
      <button
        class="flex-1 flex items-center justify-center p-4 rounded-md hover:bg-slate-300 duration-150 transition-all"
        [class.bg-slate-300]="selectedMark() === 'X'"
        (click)="selectMark('X')"
      >
        <img [src]="iconX" alt="x" width="24" height="24" />
      </button>
      <button
        class="flex-1 flex items-center justify-center p-4 rounded-md hover:bg-slate-300 duration-150 transition-all"
        [class.bg-slate-300]="selectedMark() === 'O'"
        (click)="selectMark('O')"
      >
        <img [src]="iconO" alt="o" width="24" height="24" />
      </button>
    </div>
  `,
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
