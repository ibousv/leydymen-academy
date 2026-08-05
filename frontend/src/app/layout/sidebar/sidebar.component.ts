import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../../shared/constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly open = input(false);

  readonly close = output<void>();

  protected readonly navItems = NAV_ITEMS;
}
