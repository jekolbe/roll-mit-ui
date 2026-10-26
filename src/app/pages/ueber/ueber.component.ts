import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-ueber',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './ueber.html',
})
export class UeberComponent {}
