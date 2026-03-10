import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GamePage } from './game-page';

describe('GamePage', () => {
  let component: GamePage;
  let fixture: ComponentFixture<GamePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamePage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(GamePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
