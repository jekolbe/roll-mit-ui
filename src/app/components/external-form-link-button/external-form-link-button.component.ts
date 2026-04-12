import {Component, input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-external-form-link-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './external-form-link-button.component.html',
})
export class ExternalFormLinkButtonComponent {
  readonly href = input.required<string>();
  readonly label = input.required<string>();
}
