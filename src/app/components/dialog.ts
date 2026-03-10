import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-dialog',
  imports: [],
  template: `
    <!-- Toggle button: always visible at bottom center -->
    @if (isShouldShowCollapseButton()){
    <button
      class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-slate-300 shadow-lg hover:bg-slate-700 transition-colors"
      (click)="collapsed.set(!collapsed())"
      [attr.aria-label]="collapsed() ? 'Show result' : 'Hide result'"
    >
    
      @if (collapsed()) {
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span class="text-sm font-semibold uppercase tracking-wide">Show result</span>
      } @else {
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
          />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
        <span class="text-sm font-semibold uppercase tracking-wide">Hide result</span>
      }
    </button>
    }

    <!-- Dialog panel -->
    @if (!collapsed()) {
      <div class="fixed inset-0 z-40 flex items-center justify-center">
        <div class="dialog-overlay absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="dialog relative w-full bg-slate-800 py-10 shadow-2xl">
          <div class="flex w-full flex-col items-center gap-4 px-6">
            <header class="dialog-header w-full text-center">
              <ng-content select="[header]"></ng-content>
            </header>
            <main class="dialog-body w-full text-center">
              <ng-content select="[content]"></ng-content>
            </main>
            <footer class="dialog-footer flex gap-4">
              <ng-content select="[footer]"></ng-content>
            </footer>
          </div>
        </div>
      </div>
    }
  `,
})
export class Dialog {
  isShouldShowCollapseButton = input<boolean>(false);
  collapsed = signal(false);
}
