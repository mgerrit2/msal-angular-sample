import { inject, Injectable } from '@angular/core';
import { SpinnerService } from '../spinners/spinner-service';

@Injectable({
  providedIn: 'root'
})
export class AjaxBusyService {
  // Use inject() to get the dependency
  private readonly spinner = inject(SpinnerService);

  private readonly requestCounter: number = 0;
  
  // Tweak as needed
  private readonly showDelayMs = 150; 
  private readonly minVisibleMs = 300; 

  private readonly showTimerId: any = null;
  private readonly shownAt: number | null = null;

  // Constructor is now implicit, but for clarity:
  // constructor() {}

  // **Original private beginRequest()**
  beginRequest(): void {
    console.log('AjaxBusyInterceptor::beginRequest');

     this.spinner.show();

    /*
    this.requestCounter = Math.max(this.requestCounter, 0) + 1;

    if (this.requestCounter === 1) {
      // first request: schedule delayed show
      this.showTimerId = setTimeout(() => {
        this.showTimerId = null;
        this.shownAt = Date.now();
        this.spinner.show();
      }, this.showDelayMs);
    }
      */
  }

  // **Original private endRequest()**
  endRequest(): void {
    console.log('AjaxBusyInterceptor::endRequest');

    this.spinner.hide();
    /*
    this.requestCounter = Math.max(this.requestCounter, 1) - 1;

    if (this.requestCounter === 0) {
      // if spinner not yet shown, cancel pending show
      if (this.showTimerId) {
        clearTimeout(this.showTimerId);
        this.showTimerId = null;
        return;
      }

      // if shown, enforce minimum visible duration
      if (this.shownAt) {
        const elapsed = Date.now() - this.shownAt;
        const remaining = this.minVisibleMs - elapsed;

        if (remaining > 0) {
          setTimeout(() => {
            // ensure no new requests started in the meantime
            if (this.requestCounter === 0) {
              this.spinner.hide();
              this.shownAt = null;
            }
          }, remaining);
        } else {
          this.spinner.hide();
          this.shownAt = null;
        }
      }
    }
      */
  }
}