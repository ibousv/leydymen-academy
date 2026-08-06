import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ROUTES } from '../../../shared/constants';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: '../error-page.css',
})
export class NotFoundComponent {
  protected readonly ROUTES = ROUTES;
}
