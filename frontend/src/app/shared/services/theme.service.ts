import { Injectable, signal } from '@angular/core';

export type Theme = 'theme-dark' | 'theme-light';

const STORAGE_KEY = 'am-theme';
const DEFAULT: Theme = 'theme-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly current = signal<Theme>(this.load());

  toggle(): void {
    const next: Theme = this.current() === 'theme-dark' ? 'theme-light' : 'theme-dark';
    this.apply(next);
  }

  private load(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const theme = stored ?? DEFAULT;
    this.apply(theme);
    return theme;
  }

  private apply(theme: Theme): void {
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-light');
    body.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.current.set(theme);
  }
}
