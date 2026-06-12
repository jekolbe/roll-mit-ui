import {
  afterNextRender,
  Component,
  OnDestroy,
  signal,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './home.html',
})
export class HomeComponent implements OnDestroy {
  readonly participantCount = signal(0);
  readonly incrementPulse = signal(false);

  private countUpFrame?: number;
  private incrementTimeout?: ReturnType<typeof setTimeout>;
  private pulseTimeout?: ReturnType<typeof setTimeout>;

  private readonly targetCount = 254;
  private readonly countUpDurationMs = 8000;

  constructor() {
    afterNextRender(() => this.startCountUp());
  }

  ngOnDestroy(): void {
    if (this.countUpFrame !== undefined) {
      cancelAnimationFrame(this.countUpFrame);
    }
    if (this.incrementTimeout !== undefined) {
      clearTimeout(this.incrementTimeout);
    }
    if (this.pulseTimeout !== undefined) {
      clearTimeout(this.pulseTimeout);
    }
  }

  private startCountUp(): void {
    const startTime = performance.now();

    const animate = (now: number): void => {
      const progress = Math.min((now - startTime) / this.countUpDurationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.participantCount.set(Math.floor(eased * this.targetCount));

      if (progress < 1) {
        this.countUpFrame = requestAnimationFrame(animate);
        return;
      }

      this.participantCount.set(this.targetCount);
      this.scheduleIncrement();
    };

    this.countUpFrame = requestAnimationFrame(animate);
  }

  private scheduleIncrement(): void {
    const delayMs = 10_000 + Math.random() * 5_000;
    this.incrementTimeout = setTimeout(() => {
      this.participantCount.update((count) => count + 1);
      this.incrementPulse.set(true);
      this.pulseTimeout = setTimeout(() => this.incrementPulse.set(false), 600);
      this.scheduleIncrement();
    }, delayMs);
  }
}
