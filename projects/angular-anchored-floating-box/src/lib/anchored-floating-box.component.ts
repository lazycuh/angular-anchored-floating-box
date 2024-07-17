/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Host,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs';

import { Theme } from './theme';
import { isMobile, viewportVerticalSizeChanges } from './utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '"lc-anchored-floating-box-container " + (_className() ? " " + _className() : "")'
  },

  selector: 'lc-anchored-floating-box',
  standalone: true,
  styleUrls: ['./anchored-floating-box.component.scss'],
  templateUrl: './anchored-floating-box.component.html'
})
export class AnchoredFloatingBoxComponent implements OnInit, OnDestroy {
  protected readonly _className = signal<string | undefined>(undefined);
  protected readonly _theme = signal<Theme>('light');

  /**
   * The target at which the floating is placed
   */
  private _anchor!: Element;

  /**
   * Are we entering into viewport or leaving?
   */
  private _enter = false;

  /**
   * The DOM element for this floating box
   */
  private _floatingBox: HTMLElement | null = null;

  private _viewportVerticalSizeChangeSubscription?: Subscription;
  private _afterClosedListeners?: Array<() => void>;
  private _afterOpenedListeners?: Array<() => void>;

  constructor(
    @Host() private readonly _host: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) private readonly _platformId: object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }

    if (isMobile()) {
      this._viewportVerticalSizeChangeSubscription = viewportVerticalSizeChanges().subscribe({
        next: event => {
          if (this._floatingBox) {
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
        }
      });
    }
  }

  ngOnDestroy() {
    this._viewportVerticalSizeChangeSubscription?.unsubscribe();

    this._afterClosedListeners = undefined;
    this._afterOpenedListeners = undefined;
  }

  @HostListener('click', ['$event'])
  protected _onPreventClickEventFromBubbling(event: Event) {
    event.stopPropagation();
  }

  setClassName(className: string) {
    this._className.set(className);
  }

  setTheme(theme: Theme) {
    this._theme.set(theme);
  }

  /**
   * Close this anchored floating box
   */
  close() {
    this._enter = false;
    this._host.nativeElement.classList.add('leave');
  }

  addAfterClosedListener(listener: () => void) {
    if (!Array.isArray(this._afterClosedListeners)) {
      this._afterClosedListeners = [];
    }

    this._afterClosedListeners.push(listener);
  }

  addAfterOpenedListener(listener: () => void) {
    if (!Array.isArray(this._afterOpenedListeners)) {
      this._afterOpenedListeners = [];
    }

    this._afterOpenedListeners.push(listener);
  }

  /**
   * Open a floating box anchored at `anchor`
   *
   * @param anchor The target at which to place this anchored floating box
   * @param content The body content to show
   */
  open(anchor: Element, content: Element | DocumentFragment) {
    this._floatingBox = this._host.nativeElement.querySelector('.lc-anchored-floating-box')!;
    this._anchor = anchor;
    this._floatingBox.querySelector('.lc-anchored-floating-box__content')?.appendChild(content);
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

        this._floatingBox!.classList.remove('bottom');
        this._floatingBox!.classList.add('top');
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

      this._floatingBox!.classList.add('visible');

      this._enter = true;
      this._host.nativeElement.classList.add('enter');
    });
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
    if (!this._enter) {
      this._afterClosedListeners?.forEach(listener => {
        listener();
      });
    } else {
      this._afterOpenedListeners?.forEach(listener => {
        listener();
      });
    }
  }
}
