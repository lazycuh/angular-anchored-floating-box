import { ChangeDetectionStrategy, Component, TemplateRef } from '@angular/core';
import { AnchoredFloatingBoxService } from 'projects/angular-anchored-floating-box/src/public-api';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'lc-root',
  standalone: true,
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private readonly _floatingBoxService: AnchoredFloatingBoxService) {
    AnchoredFloatingBoxService.setDefaultTheme('light');
  }

  openFloatingBox(anchor: HTMLButtonElement, templateRef: TemplateRef<object>) {
    this._floatingBoxService.open({
      anchor,
      className: 'optional-class-name',
      content: templateRef,
      context: {
        $implicit: 'Angular!!!',
        greeting: 'Hello'
      },
      theme: 'dark'
    });
  }
}
