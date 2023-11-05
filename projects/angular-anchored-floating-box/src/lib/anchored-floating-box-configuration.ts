import { TemplateRef, Type } from '@angular/core';

import { Theme } from './theme';

/**
 * The configuration object for the current anchored floating box.
 * The type parameter `C` describes the type of the optional
 * context object passed to `TemplateRef<C>`.
 */
export interface AnchoredFloatingBoxConfiguration<C extends Record<string, unknown> | unknown = unknown> {
  /**
   * The required element that the floating box will be anchored to.
   */
  anchor: Element;

  /**
   * The optional class name to add to the anchored floating box's container.
   */
  className?: string;

  /**
   * The required content to show, it accepts `TemplateRef` as well as any `@Component()` class.
   */
  content: TemplateRef<C> | Type<unknown>;

  /**
   * The optional context object that is referenced by the template ref.
   */
  context?: C;

  /**
   * The optional theme for the floating box. Default is {@link Theme.LIGHT Theme.LIGHT}.
   */
  theme?: Theme;
}
