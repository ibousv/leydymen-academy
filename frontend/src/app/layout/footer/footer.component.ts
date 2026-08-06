import { ChangeDetectionStrategy, Component } from '@angular/core';
import { APP_NAME, APP_TAGLINE } from '../../shared/constants';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  protected readonly APP_NAME = APP_NAME;
  protected readonly APP_TAGLINE = APP_TAGLINE;
  protected readonly year = new Date().getFullYear();
}
