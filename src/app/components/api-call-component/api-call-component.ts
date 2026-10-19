import { Component } from '@angular/core';
import {ButtonModule} from 'primeng/button';

@Component({
  selector: 'app-api-call-component',
  imports: [ButtonModule],
  templateUrl: './api-call-component.html',
  styleUrl: './api-call-component.css',
})
export class ApiCallComponent {
  callApi(){

  }
}
