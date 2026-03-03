import { Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'silver' | 'dark';
export type ButtonSize = 'lg' | 'sm' | 'icon' | 'cell';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('lg');

  buttonClasses = computed(() => {
    const v = this.variant();
    const s = this.size();

    // Base common classes
    let classes =
      'inline-flex items-center justify-center font-bold uppercase transition-all duration-100 ease-in-out border-none cursor-pointer tracking-wider text-slate-900 focus:outline-none ';

    // Size variants
    if (s === 'lg') {
      classes += 'text-preset-3 rounded-[15px] pt-[18px] pb-[26px] px-8 w-full ';
    } else if (s === 'sm') {
      classes += 'text-preset-4 rounded-[10px] pt-[14px] pb-[18px] px-4 ';
    } else if (s === 'icon') {
      classes += 'rounded-[10px] p-4 text-preset-3 ';
    } else if (s === 'cell') {
      classes += 'rounded-[15px] w-full h-full p-4 sm:p-6 ';
    }

    // Color variants
    if (v === 'primary') {
      classes += 'bg-amber-400 hover:bg-amber-300 ';
      if (s === 'lg') {
        classes +=
          'shadow-[0_8px_0_0_var(--color-amber-400-shadow)] active:shadow-[0_0px_0_0_var(--color-amber-400-shadow)] active:translate-y-[8px] ';
      } else {
        classes +=
          'shadow-[0_4px_0_0_var(--color-amber-400-shadow)] active:shadow-[0_0px_0_0_var(--color-amber-400-shadow)] active:translate-y-[4px] ';
      }
    } else if (v === 'secondary') {
      classes += 'bg-teal-400 hover:bg-teal-300 ';
      if (s === 'lg') {
        classes +=
          'shadow-[0_8px_0_0_var(--color-teal-400-shadow)] active:shadow-[0_0px_0_0_var(--color-teal-400-shadow)] active:translate-y-[8px] ';
      } else {
        classes +=
          'shadow-[0_4px_0_0_var(--color-teal-400-shadow)] active:shadow-[0_0px_0_0_var(--color-teal-400-shadow)] active:translate-y-[4px] ';
      }
    } else if (v === 'silver') {
      classes += 'bg-slate-300 hover:bg-slate-100 ';
      if (s === 'lg') {
        classes +=
          'shadow-[0_8px_0_0_var(--color-slate-300-shadow)] active:shadow-[0_0px_0_0_var(--color-slate-300-shadow)] active:translate-y-[8px] ';
      } else {
        classes +=
          'shadow-[0_4px_0_0_var(--color-slate-300-shadow)] active:shadow-[0_0px_0_0_var(--color-slate-300-shadow)] active:translate-y-[4px] ';
      }
    } else if (v === 'dark') {
      classes += 'bg-slate-800 hover:bg-slate-700 ';
      if (s === 'lg' || s === 'cell') {
        classes +=
          'shadow-[0_8px_0_0_var(--color-slate-800-shadow)] active:shadow-[0_0px_0_0_var(--color-slate-800-shadow)] active:translate-y-[8px] ';
      } else {
        classes +=
          'shadow-[0_4px_0_0_var(--color-slate-800-shadow)] active:shadow-[0_0px_0_0_var(--color-slate-800-shadow)] active:translate-y-[4px] ';
      }
    }

    return classes.trim();
  });
}
