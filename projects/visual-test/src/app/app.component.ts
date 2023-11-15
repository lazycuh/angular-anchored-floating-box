import { Component, TemplateRef } from '@angular/core';
import { AnchoredFloatingBoxService, Theme } from 'projects/angular-anchored-floating-box/src/public-api';

@Component({
  selector: 'bbb-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private readonly _floatingBoxService: AnchoredFloatingBoxService) {
    AnchoredFloatingBoxService.setDefaultTheme(Theme.LIGHT);
  }

  openFloatingBox(anchor: HTMLButtonElement, templateRef: TemplateRef<unknown>) {
    this._floatingBoxService.open({
      anchor,
      className: 'optional-class-name',
      content: templateRef,
      context: {
        $implicit: 'Angular!!!',
        greeting: 'Hello'
      },
      theme: Theme.DARK
    });
  }
}
