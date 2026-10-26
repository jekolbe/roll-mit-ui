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
    path: 'teilnahmebedingungen',
    loadComponent: () =>
      import('./pages/teilnahmebedingungen/teilnahmebedingungen.component').then(
        (m) => m.TeilnahmebedingungenComponent,
      ),
  },
  {
    path: 'ueber/2026',
    loadComponent: () =>
      import('./pages/ueber/ueber-2026.component').then((m) => m.Ueber2026Component),
  },
  {
    path: 'ueber',
    loadComponent: () => import('./pages/ueber/ueber.component').then(m => m.UeberComponent),
  },
  {
    path: 'strecke',
    loadComponent: () => import('./pages/strecke/strecke.component').then(m => m.StreckeComponent),
  },
  {
    path: 'anmelden',
    loadComponent: () =>
      import('./pages/anmelden/anmelden.component').then(m => m.AnmeldenComponent),
  },
  {
    path: 'orga-team',
    loadComponent: () =>
      import('./pages/orga-team/orga-team.component').then((m) => m.OrgaTeamComponent),
  },
  {
    path: 'material',
    loadComponent: () =>
      import('./pages/material/material.component').then((m) => m.MaterialComponent),
  },
  {
    path: 'bilder',
    loadComponent: () =>
      import('./pages/bilder/bilder.component').then((m) => m.BilderComponent),
  },
  {
    path: 'helfen',
    loadComponent: () =>
      import('./pages/mithelfen/mithelfen-layout.component').then((m) => m.MithelfenLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/mithelfen/mithelfen.component').then((m) => m.MithelfenComponent),
      },
      {
        path: ':rolleSlug',
        loadComponent: () =>
          import('./pages/mithelfen/mithelfen-rolle.component').then((m) => m.MithelfenRolleComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
