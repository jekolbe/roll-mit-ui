import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  inject,
  output,
} from '@angular/core';

@Directive({
  selector: 'img[bilderImageReveal]',
})
export class BilderImageRevealDirective implements AfterViewInit {
  private readonly img = inject(ElementRef<HTMLImageElement>);

  readonly revealed = output<void>();

  ngAfterViewInit(): void {
    const el = this.img.nativeElement;
    if (el.complete && el.naturalWidth > 0) {
      queueMicrotask(() => this.revealed.emit());
    }
  }

  @HostListener('load')
  onLoad(): void {
    this.revealed.emit();
  }
}
