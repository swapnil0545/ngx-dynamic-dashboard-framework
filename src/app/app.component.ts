import { Component } from '@angular/core';
import { HostBinding } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { EventService } from './eventservice/event.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'plm-ui';

  constructor() {}
}
