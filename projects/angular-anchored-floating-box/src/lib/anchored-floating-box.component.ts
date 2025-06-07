import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  EmbeddedViewRef,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation
} from '@angular/core';

import { AnchoredFloatingBoxRenderer } from './anchored-floating-box-renderer.component';
import { Theme } from './theme';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [AnchoredFloatingBoxRenderer],
  selector: 'lc-anchored-floating-box',
  standalone: true,
  styleUrls: ['./anchored-floating-box.component.scss'],
  templateUrl: './anchored-floating-box.component.html'
})
export class AnchoredFloatingBox {
  private static _defaultTheme: Theme = 'light';

  readonly className = input<string>(undefined, { alias: 'class' });
  readonly theme = input<Theme>(AnchoredFloatingBox._defaultTheme);

  /**
   * Called when the floating box's leaving animation is completed.
   */
  readonly closed = output();
  readonly beforeOpened = output();

  /**
   * Called when the floating box's entering animation is completed.
   */
  readonly opened = output();

  /**
   * The target at which the floating is placed
   */
  protected readonly _anchor = signal<Element | null>(null);
  protected readonly _isOpened = signal(false);

  private readonly _templateRef = viewChild.required(TemplateRef);
  private readonly _applicationRef = inject(ApplicationRef);

  private _renderedTemplate!: EmbeddedViewRef<unknown>;

  static setDefaultTheme(theme: Theme) {
    this._defaultTheme = theme;
  }

  close() {
    this._isOpened.set(false);
  }

  /**
   * Open a floating box anchored at `anchor`
   *
   * @param anchor The target at which to place this anchored floating box
   * @param content The body content to show
   */
  open(anchor: Element) {
    this.beforeOpened.emit();

    this._renderedTemplate = this._templateRef().createEmbeddedView({}, this._applicationRef.injector);

    this._applicationRef.attachView(this._renderedTemplate);

    this._anchor.set(anchor);
    this._isOpened.set(true);
  }

  protected _onClosed() {
    this.closed.emit();
    this._applicationRef.detachView(this._renderedTemplate);
    this._renderedTemplate.destroy();
  }
}
