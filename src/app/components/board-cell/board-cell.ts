import { Component, input, output, signal } from '@angular/core';
import { Button } from '@app/components/button/button';
import iconO from '@assets/icon-o.svg';
import iconX from '@assets/icon-x.svg';
import iconOOutline from '@assets/icon-o-outline.svg';
import iconXOutline from '@assets/icon-x-outline.svg';
import { Mark } from '@app/services/game-service';

@Component({
  selector: 'app-board-cell',
  imports: [Button],
  templateUrl: './board-cell.html',
  styleUrl: './board-cell.css',
})
export class BoardCell {
  value = input.required<Mark>();
  isWinning = input<boolean>(false);
  currentPlayer = input.required<Mark>();

  cellClick = output<void>();

  isHovered = signal(false);

  iconO = iconO;
  iconX = iconX;
  iconOOutline = iconOOutline;
  iconXOutline = iconXOutline;

  get isEmpty() {
    return this.value() === '';
  }

  handleClick() {
    if (this.isEmpty) {
      this.cellClick.emit();
    }
  }
}
