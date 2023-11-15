import { AnchoredFloatingBoxComponent } from './anchored-floating-box.component';

/**
 * A reference to the opened anchored floating box that can be used to
 * close it, or to add the listeners to be invoked depending on
 * whether the floating box is opened or closed.
 */
export class AnchoredFloatingBoxRef {
  constructor(private readonly _instance: AnchoredFloatingBoxComponent) {}

  /**
   * Close this anchored floating box only.
   */
  close() {
    this._instance.close();
  }

  /**
   * Add a callback to be invoked after the floating box is closed.
   */
  addAfterClosedListener(listener: () => void) {
    this._instance.addAfterClosedListener(listener);
  }

  /**
   * Add a callback to be invoked after the floating box is opened.
   */
  addAfterOpenedListener(listener: () => void) {
    this._instance.addAfterOpenedListener(listener);
  }
}
