import {HttpClient} from '@angular/common/http';
import {Component, inject, signal} from '@angular/core';
import {catchError, map, of} from 'rxjs';
import {
  BILDER_MANIFEST_FALLBACK_URL,
  BILDER_MANIFEST_URL,
  BilderManifestEntry,
} from './bilder.data';

function sortEntries(entries: BilderManifestEntry[]): BilderManifestEntry[] {
  return [...entries].sort((a, b) => {
    const org = (a.authorOrganization ?? '').localeCompare(
      b.authorOrganization ?? '',
      'de',
    );
    if (org !== 0) return org;
    const name = a.authorName.localeCompare(b.authorName, 'de');
    if (name !== 0) return name;
    return a.filename.localeCompare(b.filename, 'de');
  });
}

@Component({
  selector: 'app-bilder',
  standalone: true,
  templateUrl: './bilder.html',
})
export class BilderComponent {
  private readonly http = inject(HttpClient);

  protected readonly images = signal<BilderManifestEntry[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected imageAlt(image: BilderManifestEntry): string {
    if (image.authorOrganization) {
      return `Foto von ${image.authorName} (${image.authorOrganization})`;
    }
    return `Foto von ${image.authorName}`;
  }

  constructor() {
    this.http
      .get<BilderManifestEntry[]>(BILDER_MANIFEST_URL)
      .pipe(
        catchError(() =>
          this.http.get<BilderManifestEntry[]>(BILDER_MANIFEST_FALLBACK_URL),
        ),
        map(sortEntries),
        catchError(() => of(null)),
      )
      .subscribe((entries) => {
        this.loading.set(false);
        if (entries === null) {
          this.error.set(
            'Die Bilder konnten gerade nicht geladen werden. Bitte versuche es später erneut.',
          );
          return;
        }
        this.images.set(entries);
      });
  }
}
