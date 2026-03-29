import {CommonModule, isPlatformBrowser} from '@angular/common';
import {afterNextRender, Component, DestroyRef, inject, PLATFORM_ID, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** 13. April, 10:00 Uhr (lokale Zeit) — Öffnung der Anmeldung */
const REGISTRATION_OPENS_AT = new Date(2026, 3, 13, 10, 0, 0, 0);

@Component({
  selector: 'app-anmelden',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './anmelden.html',
})
export class AnmeldenComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly countdown = signal<CountdownParts | null>(null);
  readonly expired = signal(false);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const targetMs = REGISTRATION_OPENS_AT.getTime();

      const tick = (): void => {
        const diff = targetMs - Date.now();
        if (diff <= 0) {
          this.expired.set(true);
          this.countdown.set({days: 0, hours: 0, minutes: 0, seconds: 0});
          return;
        }
        const totalSeconds = Math.floor(diff / 1000);
        this.countdown.set({
          days: Math.floor(totalSeconds / 86400),
          hours: Math.floor((totalSeconds % 86400) / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        });
      };

      tick();
      const id = window.setInterval(tick, 1000);
      this.destroyRef.onDestroy(() => window.clearInterval(id));
    });
  }

  pad2(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
