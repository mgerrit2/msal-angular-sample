import { ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import {SpinnerService} from '../../../services/spinners/spinner-service';

@Component({
  selector: 'app-spinner',
  imports: [ProgressSpinnerModule,CommonModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss',
  standalone:true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Spinner {


    // Dependency Injection using inject()
   private readonly spinnerService = inject(SpinnerService);

    // Consuming the Observable with toSignal()
    showSpinner = toSignal(this.spinnerService.spinnerObservable, {
      initialValue: false
    });


  }


