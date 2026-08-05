import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ROUTES } from '../../../shared/constants';

@Component({
  selector: 'app-server-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './server-error.component.html',
  styleUrl: '../error-page.css',
})
export class ServerErrorComponent {
  protected readonly ROUTES = ROUTES;
}
