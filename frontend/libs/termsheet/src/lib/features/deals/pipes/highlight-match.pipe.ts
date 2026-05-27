import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'highlightMatch',
  standalone: true,
  pure: true,
})
export class HighlightMatchPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined, term: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const highlighted = value.replace(new RegExp(`(${term})`, 'gi'), '<mark>$1</mark>');

    return this.sanitizer.sanitize(SecurityContext.HTML, highlighted) ?? '';
  }
}
