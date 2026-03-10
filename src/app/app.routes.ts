import { Routes } from '@angular/router';
import { GamePage } from './pages/game-page';
import { HomePage } from './pages/home-page';
import { NotFound } from './pages/not-found';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'game',
    children: [
      {
        path: 'single',
        component: GamePage,
      },
      {
        path: 'multi/:roomId',
        component: GamePage,
      },
      {
        path: '**',
        redirectTo: '/404',
      },
    ],
  },
  {
    path: '404',
    component: NotFound,
  },
  {
    path: '**',
    component: NotFound,
  },
];
