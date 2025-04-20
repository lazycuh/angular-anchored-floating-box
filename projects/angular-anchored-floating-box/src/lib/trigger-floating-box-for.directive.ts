import { Directive, HostListener, inject, input, TemplateRef } from '@angular/core';

import { AnchoredFloatingBoxService } from './anchored-floating-box.service';
import { Theme } from './theme';

@Directive({
  selector: '[lcTriggerFloatingBoxFor]'
})
export class TriggerFloatingBoxForDirective {
  readonly templateRef = input.required<TemplateRef<unknown>>({ alias: 'lcTriggerFloatingBoxFor' });
  readonly context = input<Record<string, unknown>>(undefined, { alias: 'lcFloatingBoxContext' });
  readonly theme = input<Theme>(undefined, { alias: 'lcFloatingBoxTheme' });

  private readonly _anchoredFloatingBoxService = inject(AnchoredFloatingBoxService);

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();

    this._anchoredFloatingBoxService.open({
      anchor: event.target as HTMLElement,
      content: this.templateRef(),
      context: this.context(),
      theme: this.theme()
    });
  }
}
