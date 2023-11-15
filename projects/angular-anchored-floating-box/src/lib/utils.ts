import { fromEvent, Observable } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';

export function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export interface ResizeEvent {
  height: number;
  resizeFactor: number;
  width: number;
}

export function viewportVerticalSizeChanges(): Observable<ResizeEvent> {
  let previousVisibleViewportBoundingBox = document.body.getBoundingClientRect();
  return fromEvent(window, 'resize').pipe(
    debounceTime(250),
    map(() => {
      const currentVisibleViewportBoundingBox = document.body.getBoundingClientRect();
      const deltaWidth = Math.abs(currentVisibleViewportBoundingBox.width - previousVisibleViewportBoundingBox.width);
      const deltaHeight = Math.abs(
        currentVisibleViewportBoundingBox.height - previousVisibleViewportBoundingBox.height
      );

      previousVisibleViewportBoundingBox = currentVisibleViewportBoundingBox;
      if (deltaHeight > deltaWidth) {
        return {
          height: currentVisibleViewportBoundingBox.height,
          resizeFactor: currentVisibleViewportBoundingBox.height / previousVisibleViewportBoundingBox.height,
          width: currentVisibleViewportBoundingBox.width
        };
      }
      return null;
    }),
    filter(event => event !== null)
  ) as unknown as Observable<ResizeEvent>;
}
