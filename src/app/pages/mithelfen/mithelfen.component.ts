import {NgClass} from '@angular/common';
import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {ExternalFormLinkButtonComponent} from '../../components/external-form-link-button/external-form-link-button.component';
import {HELFER_FORMULAR_URL, HELFER_ROLLEN} from './helfen-rollen.data';

@Component({
  selector: 'app-mithelfen',
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    ExternalFormLinkButtonComponent,
  ],
  templateUrl: './mithelfen.html',
})
export class MithelfenComponent {
  protected readonly rollen = HELFER_ROLLEN;
  protected readonly formularUrl = HELFER_FORMULAR_URL;
}
