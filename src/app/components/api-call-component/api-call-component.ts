import {Component, inject} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {RestApi} from '../../rest/rest-api';
import {firstValueFrom} from 'rxjs';
import {InputTextModule} from 'primeng/inputtext';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-api-call-component',
  imports: [CommonModule, FormsModule,
    InputTextModule, ButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './api-call-component.html',
  styleUrl: './api-call-component.css',
})
export class ApiCallComponent {

  restApi = inject(RestApi);

  get getApiResponseData(): FormControl {
    // We cast it to FormControl to easily access its value property later
    return this.form.get('apiResponseData') as FormControl;
  }

  form  = new FormGroup({
    apiResponseData: new FormControl(''),
  });

  async callApi(){

    try {
      let result = await firstValueFrom(this.restApi.getProtectedData());

      this.getApiResponseData.setValue(result);
    }catch (e){
      console.error(e);
    }
  }
}
