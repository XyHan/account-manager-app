import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Locale = 'fr' | 'en';

const STORAGE_KEY = 'am-locale';
const DEFAULT: Locale = 'fr';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly translateService = inject(TranslateService);
  readonly current = signal<Locale>(DEFAULT);

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    this.apply(stored ?? DEFAULT);
  }

  toggle(): void {
    this.apply(this.current() === 'fr' ? 'en' : 'fr');
  }

  private apply(locale: Locale): void {
    this.translateService.use(locale);
    localStorage.setItem(STORAGE_KEY, locale);
    this.current.set(locale);
  }
}
