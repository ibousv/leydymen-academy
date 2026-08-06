import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAME, ROUTES } from '../../shared/constants';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly toggleSidebar = output<void>();

  protected readonly APP_NAME = APP_NAME;
  protected readonly ROUTES = ROUTES;
}
