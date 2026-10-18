import {Component, OnInit} from '@angular/core';
import {MsalService} from '@azure/msal-angular';
import {CommonModule} from '@angular/common';
import { AccountInfo } from '@azure/msal-browser';

@Component({
  selector: 'app-profile-component',
  imports: [CommonModule],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.css',
})
export class ProfileComponent implements OnInit {
  profileData?: AccountInfo;

  constructor(private authService: MsalService) {}

  ngOnInit(): void {
    // Haal het actieve account op uit de MSAL instantie
    this.profileData = this.authService.instance.getActiveAccount() || undefined;
  }
}
