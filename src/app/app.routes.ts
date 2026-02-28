import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'ueber',
    loadComponent: () => import('./pages/ueber/ueber.component').then(m => m.UeberComponent),
  },
  {
    path: 'helfen',
    loadComponent: () => import('./pages/mithelfen/mithelfen.component').then(m => m.MithelfenComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
