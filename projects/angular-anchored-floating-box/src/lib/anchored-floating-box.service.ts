import { ApplicationRef, createComponent, Injectable, TemplateRef } from '@angular/core';

import { AnchoredFloatingBoxComponent } from './anchored-floating-box.component';
import { AnchoredFloatingBoxConfiguration } from './anchored-floating-box-configuration';
import { AnchoredFloatingBoxRef } from './anchored-floating-box-ref';
import { Theme } from './theme';

/**
 * This class allows to show a floating box anchored at an element.
 * See {@see AnchoredFloatingBoxConfiguration} for the different
 * options to configure the floating box.
 */
@Injectable({
  providedIn: 'root'
})
export class AnchoredFloatingBoxService {
  private static _defaultTheme: Theme = 'light';

  constructor(private readonly _applicationRef: ApplicationRef) {}

  /**
   * Set the default theme that will be used for all floating boxes created in the future.
   *
   * @param theme The new theme to be used as the default.
   */
  static setDefaultTheme(theme: Theme) {
    AnchoredFloatingBoxService._defaultTheme = theme;
  }

  /**
   * Open a new floating box with a configuration object specified by `configuration`. This service
   * supports rendering [`TemplateRef`](https://angular.io/api/core/TemplateRef) as well as any
   * [`@Component`](https://angular.io/api/core/Component) class.
   *
   * Type parameter `T` refers to the type of template context object.
   *
   * @param configuration The configuration object for the anchored floating box.
   *
   * @returns A ref object used to interact with the created floating box.
   */
  open(configuration: AnchoredFloatingBoxConfiguration): AnchoredFloatingBoxRef {
    const floatingBoxComponentRef = createComponent(AnchoredFloatingBoxComponent, {
      environmentInjector: this._applicationRef.injector
    });
    const floatingBoxRef = new AnchoredFloatingBoxRef(floatingBoxComponentRef.instance);
    const createdContent = this._createContent(configuration);

    floatingBoxRef.addAfterClosedListener(() => {
      this._applicationRef.detachView(floatingBoxComponentRef.hostView);
      floatingBoxComponentRef.destroy();
      createdContent.ref.destroy();
    });

    if (configuration.className) {
      floatingBoxComponentRef.instance.setClassName(configuration.className);
    }

    floatingBoxComponentRef.instance.setTheme(configuration.theme ?? AnchoredFloatingBoxService._defaultTheme);

    floatingBoxComponentRef.instance.open(configuration.anchor, createdContent.rootNode);

    this._applicationRef.attachView(floatingBoxComponentRef.hostView);

    document.body.appendChild(floatingBoxComponentRef.location.nativeElement);

    return floatingBoxRef;
  }

  private _createContent(configuration: AnchoredFloatingBoxConfiguration) {
    if (configuration.content instanceof TemplateRef) {
      const embeddedView = configuration.content.createEmbeddedView(configuration.context ?? {});

      this._applicationRef.attachView(embeddedView);

      return {
        ref: embeddedView,
        /**
         * If the markups inside the provided template ref aren't being wrapped inside
         * a containing DOM element, then there will be multiple root nodes, in this case,
         * we want to add them all as the content by appending them to a document fragment
         */
        rootNode: (embeddedView.rootNodes as HTMLElement[]).reduce((fragment, next) => {
          fragment.appendChild(next);

          return fragment;
        }, document.createDocumentFragment())
      };
    }

    const componentRef = createComponent(configuration.content, { environmentInjector: this._applicationRef.injector });

    this._applicationRef.attachView(componentRef.hostView);

    return {
      ref: componentRef,
      rootNode: componentRef.location.nativeElement as Element
    };
  }
}
