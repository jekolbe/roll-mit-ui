import {NgClass} from '@angular/common';
import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {map, tap} from 'rxjs';
import {ExternalFormLinkButtonComponent} from '../../components/external-form-link-button/external-form-link-button.component';
import {HELFER_FORMULAR_URL, HELFER_ROLLEN_BY_SLUG} from './helfen-rollen.data';

@Component({
  selector: 'app-mithelfen-rolle',
  standalone: true,
  imports: [NgClass, RouterLink, MatIconModule, ExternalFormLinkButtonComponent],
  templateUrl: './mithelfen-rolle.html',
})
export class MithelfenRolleComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly formUrl = HELFER_FORMULAR_URL;

  protected readonly rolle = toSignal(
    this.route.paramMap.pipe(
      map((pm) => pm.get('rolleSlug')),
      tap((slug) => {
        if (slug && !HELFER_ROLLEN_BY_SLUG[slug]) {
          void this.router.navigate(['/helfen']);
        }
      }),
      map((slug) => (slug ? HELFER_ROLLEN_BY_SLUG[slug] : undefined)),
    ),
    {initialValue: undefined},
  );
}
