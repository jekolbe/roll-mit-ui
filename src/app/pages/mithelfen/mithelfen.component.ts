import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-mithelfen',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './mithelfen.html',
})
export class MithelfenComponent {}
