/* eslint-disable no-console */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AnchoredFloatingBox } from 'projects/angular-anchored-floating-box/src/lib/anchored-floating-box.component';
import { TriggerFloatingBoxForDirective } from 'projects/angular-anchored-floating-box/src/public-api';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnchoredFloatingBox, TriggerFloatingBoxForDirective],
  selector: 'lc-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html'
})
export class AppComponent {
  onOpened() {
    console.log('opened');
  }

  onClosed() {
    console.log('closed');
  }
}
