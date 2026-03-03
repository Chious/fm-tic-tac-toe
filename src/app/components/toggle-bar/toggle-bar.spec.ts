import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleBar } from './toggle-bar';

describe('ToggleBar', () => {
  let component: ToggleBar;
  let fixture: ComponentFixture<ToggleBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleBar],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
