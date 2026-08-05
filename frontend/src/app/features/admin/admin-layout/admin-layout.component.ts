import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ROUTES } from '../../../shared/constants';

/** Coquille du panneau d'administration (spec §4.8). */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  protected readonly ROUTES = ROUTES;

  protected readonly adminNav = [
    { route: ROUTES.admin, label: 'Tableau de bord', exact: true },
    { route: ROUTES.adminUsers, label: 'Utilisateurs', exact: false },
    { route: ROUTES.adminFormations, label: 'Formations', exact: false },
    { route: ROUTES.adminStatistics, label: 'Statistiques', exact: false },
  ];
}
