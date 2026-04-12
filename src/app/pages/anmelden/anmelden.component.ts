import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {ExternalFormLinkButtonComponent} from '../../components/external-form-link-button/external-form-link-button.component';

/** Anmeldeformular (Vereinscloud ADFC BW) */
export const ANMELDE_FORMULAR_URL =
  'https://vcloud.adfc-bw.de/index.php/apps/forms/s/Ts6KDArSfw7sBXFPermmptrR';

@Component({
  selector: 'app-anmelden',
  standalone: true,
  imports: [MatIconModule, ExternalFormLinkButtonComponent],
  templateUrl: './anmelden.html',
})
export class AnmeldenComponent {
  readonly registrationFormUrl = ANMELDE_FORMULAR_URL;
}
