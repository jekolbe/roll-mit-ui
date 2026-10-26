import {RenderMode, ServerRoute} from '@angular/ssr';
import {HELFER_ROLLEN} from './pages/mithelfen/helfen-rollen.data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'helfen/:rolleSlug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return HELFER_ROLLEN.map((r) => ({rolleSlug: r.slug}));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
