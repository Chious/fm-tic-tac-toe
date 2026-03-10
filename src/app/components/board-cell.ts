import { Component, input, output, signal } from '@angular/core';
import { Button } from '@app/components/button';
import iconO from '@assets/icon-o.svg';
import iconX from '@assets/icon-x.svg';
import iconOOutline from '@assets/icon-o-outline.svg';
import iconXOutline from '@assets/icon-x-outline.svg';
import { Mark } from '@app/services/game-service';

@Component({
  selector: 'app-board-cell',
  imports: [Button],
  template: `
    <div class="w-full aspect-square">
      <app-button
        class="block w-full h-full"
        [class.win-animation]="isWinning()"
        [class.cursor-not-allowed]="!isEmpty"
        [variant]="isWinning() ? (value() === 'X' ? 'secondary' : 'primary') : 'dark'"
        size="cell"
        (mouseenter)="isHovered.set(true)"
        (mouseleave)="isHovered.set(false)"
        (click)="handleClick()"
      >
        @if (value() === 'X') {
          <img
            [src]="isWinning() ? iconXOutline : iconX"
            alt="x"
            class="mx-auto w-10 h-10 sm:w-16 sm:h-16"
          />
        } @else if (value() === 'O') {
          <img
            [src]="isWinning() ? iconOOutline : iconO"
            alt="o"
            class="mx-auto w-10 h-10 sm:w-16 sm:h-16"
          />
        } @else if (isEmpty && isHovered()) {
          <img
            [src]="currentPlayer() === 'X' ? iconXOutline : iconOOutline"
            [alt]="currentPlayer()"
            class="mx-auto w-10 h-10 opacity-50 sm:w-16 sm:h-16"
          />
        }
      </app-button>
    </div>
  `,
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
