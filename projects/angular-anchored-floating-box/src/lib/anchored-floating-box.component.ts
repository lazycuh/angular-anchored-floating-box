/* eslint-disable @angular-eslint/component-class-suffix */
import {
  afterNextRender,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EmbeddedViewRef,
  HostListener,
  inject,
  input,
  output,
  TemplateRef,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Theme } from './theme';
import { viewportVerticalSizeChanges } from './utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: 'lc-anchored-floating-box',
  standalone: true,
  styleUrls: ['./anchored-floating-box.component.scss'],
  templateUrl: './anchored-floating-box.component.html'
})
export class AnchoredFloatingBox {
  private static _defaultTheme: Theme = 'light';

  readonly className = input<string>(undefined, { alias: 'class' });
  readonly theme = input<Theme>(AnchoredFloatingBox._defaultTheme);

  readonly closed = output();
  readonly beforeOpened = output();
  readonly opened = output();

  private readonly _templateRef = viewChild.required(TemplateRef);
  private readonly _applicationRef = inject(ApplicationRef);

  private _renderedTemplate!: EmbeddedViewRef<unknown>;
  private _floatingBoxContainer!: HTMLElement;

  /**
   * The DOM element for this floating box
   */
  private _floatingBox: HTMLElement | null = null;

  /**
   * The target at which the floating is placed
   */
  private _anchor!: Element;

  /**
   * Are we entering into viewport or leaving?
   */

  private _isEntering = false;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender({
      write: () => {
        viewportVerticalSizeChanges()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: event => {
              if (!this._floatingBox) {
                return;
              }

              const floatingBoxBoundingBox = this._floatingBox.getBoundingClientRect();

              /**
               * If this floating box's bottom is larger than the newly resized viewport's height,
               * then we want to shift this floating box up by the difference between its bottom's value
               * and the new viewport's height value, otherwise, we want to place the floating at the bottom
               * of the anchor
               */
              if (floatingBoxBoundingBox.bottom >= event.height) {
                if (event.resizeFactor < 1) {
                  this._floatingBox.style.top = `${event.height - floatingBoxBoundingBox.height - 60}px`;
                }
              } else {
                this._showBottom();
              }
            }
          });
      }
    });
  }

  static setDefaultTheme(theme: Theme) {
    this._defaultTheme = theme;
  }

  protected _onPreventClickEventFromBubbling(event: Event) {
    event.stopPropagation();
  }

  /**
   * Close this anchored floating box
   */
  close() {
    this._isEntering = false;
    this._floatingBoxContainer.classList.add('is-leaving');
  }

  /**
   * Open a floating box anchored at `anchor`
   *
   * @param anchor The target at which to place this anchored floating box
   * @param content The body content to show
   */
  open(anchor: Element) {
    this._renderedTemplate = this._templateRef().createEmbeddedView({}, this._applicationRef.injector);

    this._floatingBoxContainer = this._renderedTemplate.rootNodes[0] as HTMLElement;

    this._applicationRef.attachView(this._renderedTemplate);
    document.body.appendChild(this._floatingBoxContainer);

    this._floatingBox = this._floatingBoxContainer.querySelector('.lc-anchored-floating-box')!;
    this._anchor = anchor;

    this.beforeOpened.emit();

    this._showBottom();
  }

  private _showBottom() {
    setTimeout(() => {
      const floatingBoxBoundingBox = this._floatingBox!.getBoundingClientRect();
      const anchorBoundingBox = this._anchor.getBoundingClientRect();
      const arrowHeight = 15;
      const spaceBetweenArrowAndAnchor = 10;
      // The floating box will be placed centered horizontally with the anchor.
      const floatingBoxLeft = anchorBoundingBox.left + (anchorBoundingBox.width - floatingBoxBoundingBox.width) / 2;
      let floatingBoxTop = anchorBoundingBox.bottom + spaceBetweenArrowAndAnchor;
      const isOverflowingBottomEdgeOfViewport =
        floatingBoxTop + arrowHeight + floatingBoxBoundingBox.height + spaceBetweenArrowAndAnchor >= window.innerHeight;

      /**
       * If the floating box overflows the bottom of the viewport, we want to shift the floating box
       * to the top of the anchor, but if this shifting causes the floating box to overflow
       * the top of the viewport which is when `floatingBoxTop` is negative, then we want
       * to limit the height of the floating box to the distance between the anchor's top
       * position minus some spacing.
       */
      if (isOverflowingBottomEdgeOfViewport) {
        floatingBoxTop = anchorBoundingBox.top - floatingBoxBoundingBox.height - spaceBetweenArrowAndAnchor;

        if (floatingBoxTop < 0) {
          const newFloatingBoxHeight = anchorBoundingBox.top - spaceBetweenArrowAndAnchor * 1.5;

          this._floatingBox!.style.height = `${newFloatingBoxHeight}px`;
          floatingBoxTop = spaceBetweenArrowAndAnchor / 2;
        }

        this._floatingBox!.classList.remove('bottom-anchored');
        this._floatingBox!.classList.add('top-anchored');
      } else {
        /**
         * If the floating box overflows the bottom edge of viewport, we want to shrink
         * its height by the amount of overflowing distance and some spacing.
         */
        const effectiveFloatingBoxBottom = floatingBoxTop + floatingBoxBoundingBox.height;
        const differenceBetweenFloatingBoxBottomAndViewportBottom = effectiveFloatingBoxBottom - window.innerHeight;

        if (differenceBetweenFloatingBoxBottomAndViewportBottom > 0) {
          const newFloatingBoxHeight =
            floatingBoxBoundingBox.height -
            differenceBetweenFloatingBoxBottomAndViewportBottom -
            spaceBetweenArrowAndAnchor / 2;
          this._floatingBox!.style.height = `${newFloatingBoxHeight}px`;
        }
      }

      const horizontalDifference =
        this._calculateRightEdgeOverflowingDistance(floatingBoxLeft, floatingBoxBoundingBox.width) ||
        this._calculateLeftEdgeOverflowingDistance(floatingBoxLeft);

      this._floatingBox!.style.left = `${floatingBoxLeft - horizontalDifference}px`;
      this._floatingBox!.style.top = `${floatingBoxTop}px`;

      this._isEntering = true;
      this._floatingBoxContainer.classList.add('is-entering');
    }, 32);
  }

  /**
   * Returns a value greater than 0 for the overflowing distance
   * if floating box overflows the right edge of the screen, 0 otherwise
   */
  private _calculateRightEdgeOverflowingDistance(left: number, width: number) {
    const spacing = 5;
    const difference = left + width - window.innerWidth + spacing;

    if (difference > spacing) {
      this._floatingBox!.querySelector<HTMLElement>('.lc-anchored-floating-box__arrow')!.style.left =
        `calc(50% + ${difference}px)`;

      return difference;
    }

    return 0;
  }

  /**
   * Returns a value greater than 0 for the overflowing distance
   * if floating box overflows the left edge of the screen, 0 otherwise
   */
  private _calculateLeftEdgeOverflowingDistance(left: number) {
    if (left < 0) {
      const spacing = 5;
      const newLeft = `calc(50% - ${Math.abs(left) + spacing}px)`;

      this._floatingBox!.querySelector<HTMLElement>('.lc-anchored-floating-box__arrow')!.style.left = newLeft;

      return left - spacing;
    }

    return 0;
  }

  @HostListener('window:keyup', ['$event'])
  protected _onCloseWhenEscapeKeyIsPressed(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  @HostListener('window:resize')
  protected _onWindowResize() {
    setTimeout(() => {
      this._showBottom();
    }, 250);
  }

  protected _onBackdropClick() {
    this.close();
  }

  /**
   * @private To be used by template
   */
  protected _onAnimationDone() {
    if (!this._isEntering) {
      this.closed.emit();
      document.body.removeChild(this._floatingBoxContainer);
      this._applicationRef.detachView(this._renderedTemplate);
      this._renderedTemplate.destroy();
    } else {
      this.opened.emit();
    }
  }
}
