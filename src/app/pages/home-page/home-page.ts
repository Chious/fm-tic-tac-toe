import { Component, inject } from '@angular/core';
import iconLogo from '@assets/logo.svg';
import { ToggleBar } from '@app/components/toggle-bar/toggle-bar';
import { Button } from '@app/components/button/button';
import { RouterLink } from '@angular/router';
import { GameService, Mark } from '@app/services/game-service';

@Component({
  selector: 'app-home-page',
  imports: [ToggleBar, Button, RouterLink],
  templateUrl: './home-page.html',
})
export class HomePage {
  iconLogo = iconLogo;

  private gameService = inject(GameService);

  playerState = this.gameService.getPlayerState();

  updatePlayerMark(mark: Mark) {
    this.gameService.setPlayerMark(mark);
  }
}
