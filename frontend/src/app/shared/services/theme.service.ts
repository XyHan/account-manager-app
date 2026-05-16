import { Injectable, signal } from '@angular/core';

export type Theme = 'theme-dark' | 'theme-light';

const STORAGE_KEY = 'am-theme';
const DEFAULT: Theme = 'theme-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly current = signal<Theme>(this.load());

  toggle(): void {
    const next: Theme = this.current() === 'theme-dark' ? 'theme-light' : 'theme-dark';
    this.current.set(next);
    this.applyToDOM(next);
  }

  private load(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const theme = stored ?? DEFAULT;
    this.applyToDOM(theme);
    return theme;
  }

  private applyToDOM(theme: Theme): void {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }
}
