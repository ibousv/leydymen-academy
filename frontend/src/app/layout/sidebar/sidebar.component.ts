import { ChangeDetectionStrategy, Component, inject, input, output, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../../shared/constants';
import { AuthService } from '../../core/services';
import type { UserRole } from '../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  
  readonly open = input(false);
  readonly close = output<void>();

  // Récupérer le rôle de l'utilisateur
  protected readonly userRole = computed(() => this.authService.getUserRole());

  // Filtrer les items selon le rôle
  protected readonly navItems = computed(() => {
    const role = this.userRole();
    return NAV_ITEMS.filter((item) => {
      // Si l'item n'a pas de restriction de rôles, l'afficher pour tous
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      // Sinon, vérifier que le rôle de l'utilisateur est dans la liste
      return role && item.roles.includes(role);
    });
  });
}

