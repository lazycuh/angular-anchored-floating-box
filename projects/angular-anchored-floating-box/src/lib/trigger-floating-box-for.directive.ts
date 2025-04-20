import { Directive, HostListener, inject, input, TemplateRef } from '@angular/core';

import { AnchoredFloatingBoxService } from './anchored-floating-box.service';
import { AnchoredFloatingBoxRef } from './anchored-floating-box-ref';
import { Theme } from './theme';

@Directive({
  exportAs: 'floatingBoxRef',
  selector: '[lcTriggerFloatingBoxFor]',
  standalone: true
})
export class TriggerFloatingBoxForDirective {
  readonly templateRef = input.required<TemplateRef<unknown>>({ alias: 'lcTriggerFloatingBoxFor' });
  readonly context = input<Record<string, unknown>>(undefined, { alias: 'lcFloatingBoxContext' });
  readonly theme = input<Theme>(undefined, { alias: 'lcFloatingBoxTheme' });
  readonly className = input<string>(undefined, { alias: 'lcFloatingBoxClassName' });

  private readonly _anchoredFloatingBoxService = inject(AnchoredFloatingBoxService);

  private _floatingBoxRef!: AnchoredFloatingBoxRef;

  @HostListener('click', ['$event'])
  protected _onClick(event: Event): void {
    event.stopPropagation();

    this._floatingBoxRef = this._anchoredFloatingBoxService.open({
      anchor: event.target as HTMLElement,
      className: this.className(),
      content: this.templateRef(),
      context: this.context(),
      theme: this.theme()
    });
  }

  close() {
    this._floatingBoxRef.close();
  }
}
