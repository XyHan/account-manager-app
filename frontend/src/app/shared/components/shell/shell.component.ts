import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UpperCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';
import { LocaleService } from '../../services/locale.service';
import { AuthService } from '../../../features/auth/services/auth.service';

interface NavItem {
  icon: string;
  labelKey: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    TranslatePipe,
    UpperCasePipe,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly localeService = inject(LocaleService);
  protected readonly authService = inject(AuthService);
  protected readonly collapsed = signal(false);

  protected readonly navItems: NavItem[] = [
    { icon: 'dashboard', labelKey: 'nav.dashboard', route: '/dashboard' },
    { icon: 'account_balance', labelKey: 'nav.accounts', route: '/bank-accounts' },
    { icon: 'receipt_long', labelKey: 'nav.transactions', route: '/transactions' },
    { icon: 'label', labelKey: 'nav.categories', route: '/categories' },
    { icon: 'upload_file', labelKey: 'nav.import', route: '/import' },
    { icon: 'manage_accounts', labelKey: 'nav.profile', route: '/profile/change-password' },
  ];

  toggleSidebar(): void {
    this.collapsed.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
