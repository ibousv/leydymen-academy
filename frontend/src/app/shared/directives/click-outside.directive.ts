import { Directive, ElementRef, inject, type OnDestroy, type OnInit, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject<Document>(Document);

  readonly appClickOutside = output<void>();

  private readonly onDocumentClick = (event: Event): void => {
    const target = event.target as Node | null;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.appClickOutside.emit();
    }
  };

  ngOnInit(): void {
    this.document.addEventListener('click', this.onDocumentClick, true);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('click', this.onDocumentClick, true);
  }
}
