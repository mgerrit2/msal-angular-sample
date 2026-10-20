import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

   // Private Subject for emission (best practice)
  private readonly spinnerSubject = new BehaviorSubject<boolean>(false);

  // Public Observable for consumption
  public spinnerObservable: Observable<boolean> = this.spinnerSubject.asObservable();

  constructor() { }

  show(): void {
    console.log('SpinnerService: SETTING TRUE (Emitted)');
    this.spinnerSubject.next(true); 
  }

  hide(): void {
    console.log('SpinnerService: SETTING FALSE (Emitted)');
    this.spinnerSubject.next(false);
  }


}
