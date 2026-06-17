import {HttpClient} from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {catchError, map, of} from 'rxjs';
import {
  BILDER_MANIFEST_FALLBACK_URL,
  BILDER_MANIFEST_URL,
  BilderManifestEntry,
} from './bilder.data';

const PAGE_SIZE = 10;

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
  private readonly destroyRef = inject(DestroyRef);

  private readonly loadMoreSentinel =
    viewChild<ElementRef<HTMLDivElement>>('loadMoreSentinel');

  private loadMoreObserver: IntersectionObserver | null = null;
  private loadingMoreTimeout: ReturnType<typeof setTimeout> | null = null;

  protected readonly images = signal<BilderManifestEntry[]>([]);
  protected readonly visibleCount = signal(PAGE_SIZE);
  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly visibleImages = computed(() =>
    this.images().slice(0, this.visibleCount()),
  );

  protected readonly hasMore = computed(
    () => this.visibleCount() < this.images().length,
  );

  private readonly loadedUrls = signal(new Set<string>());

  protected hasDimensions(image: BilderManifestEntry): boolean {
    return image.width != null && image.height != null && image.width > 0;
  }

  protected imageAspectRatio(image: BilderManifestEntry): string | undefined {
    if (!this.hasDimensions(image)) return undefined;
    return `${image.width} / ${image.height}`;
  }

  protected isImageLoaded(url: string): boolean {
    return this.loadedUrls().has(url);
  }

  protected markImageLoaded(url: string): void {
    if (this.loadedUrls().has(url)) return;
    this.loadedUrls.update((urls) => new Set(urls).add(url));
  }

  protected imageAlt(image: BilderManifestEntry): string {
    if (image.authorOrganization) {
      return `Foto von ${image.authorName} (${image.authorOrganization})`;
    }
    return `Foto von ${image.authorName}`;
  }

  protected imageCaption(image: BilderManifestEntry): string {
    if (image.authorOrganization) {
      return `Bild: ${image.authorOrganization} · ${image.authorName}`;
    }
    return `Bild: ${image.authorName}`;
  }

  constructor() {
    effect(() => {
      const sentinel = this.loadMoreSentinel()?.nativeElement;
      const more = this.hasMore();

      this.loadMoreObserver?.disconnect();
      this.loadMoreObserver = null;

      if (!sentinel || !more) return;

      this.loadMoreObserver = new IntersectionObserver(
        (entries) => {
          if (
            !entries.some((entry) => entry.isIntersecting) ||
            this.loadingMore()
          ) {
            return;
          }
          this.loadMoreBatch();
        },
        { rootMargin: '0px', threshold: 0 },
      );
      this.loadMoreObserver.observe(sentinel);
    });

    this.destroyRef.onDestroy(() => {
      this.loadMoreObserver?.disconnect();
      if (this.loadingMoreTimeout) {
        clearTimeout(this.loadingMoreTimeout);
      }
    });

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
        this.visibleCount.set(Math.min(PAGE_SIZE, entries.length));
      });
  }

  private loadMoreBatch(): void {
    if (!this.hasMore() || this.loadingMore()) return;

    this.loadingMore.set(true);
    this.loadingMoreTimeout = setTimeout(() => {
      this.visibleCount.update((count) =>
        Math.min(count + PAGE_SIZE, this.images().length),
      );
      this.loadingMore.set(false);
      this.loadingMoreTimeout = null;
    }, 300);
  }
}
