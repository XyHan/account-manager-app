import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p>Login — à implémenter (story 1.2)</p>`,
})
export class LoginComponent {}
