import { Directive, HostListener, input } from '@angular/core';

import { AnchoredFloatingBox } from './anchored-floating-box.component';

@Directive({
  exportAs: 'floatingBoxRef',
  selector: '[lcTriggerFloatingBoxFor]',
  standalone: true
})
export class TriggerFloatingBoxForDirective {
  readonly floatingBox = input.required<AnchoredFloatingBox>({ alias: 'lcTriggerFloatingBoxFor' });

  @HostListener('click', ['$event'])
  protected _onClick(event: Event): void {
    event.stopPropagation();

    this.floatingBox().open(event.target as HTMLElement);
  }

  close() {
    this.floatingBox().close();
  }
}
