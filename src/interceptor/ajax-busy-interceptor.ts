// src/app/interceptors/ajax-busy.interceptor.ts

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import {AjaxBusyService} from '../services/ajax/ajax-busy-service';


export const ajaxBusyInterceptor: HttpInterceptorFn = (req, next) => {
  // Use inject() to get the service instance
  const busyService = inject(AjaxBusyService);

  busyService.beginRequest(); // Start the busy state logic

  // Handle the request and ensure endRequest is called on success/failure/cancellation
  return next(req).pipe(
    finalize(() => {
      busyService.endRequest(); // End the busy state logic
    })
  );
};
