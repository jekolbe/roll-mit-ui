import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'impressum',
    loadComponent: () =>
      import('./pages/impressum/impressum.component').then(m => m.ImpressumComponent),
  },
  {
    path: 'datenschutz',
    loadComponent: () =>
      import('./pages/datenschutz/datenschutz.component').then(m => m.DatenschutzComponent),
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
