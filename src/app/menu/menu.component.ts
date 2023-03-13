import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ConfigurationComponent } from '../configuration/configuration.component';
import { EventService } from '../eventservice/event.service';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  visible = true;
  applicationTitle: string;
  constructor(
    public dialog: MatDialog,
    private eventService: EventService,
    private router: Router,
    private overlayContainer: OverlayContainer
  ) {
    this.setupEventHandlers();
    this.applicationTitle = environment.applicationTitle;
    // Set default theme here:
  }

  ngOnInit(): void {}

  setupEventHandlers() {
    this.eventService.listenForLibraryOpenMenuEvent().subscribe(() => {
      this.openGadgetLibraryDialog();
    });
  }
  openConfigDialog() {
    this.dialog.open(ConfigurationComponent, {
      width: '1000px',
    });
  }

  openGadgetLibraryDialog() {
    this.eventService.emitBoardSideToolbarClickEvent();
    /*this.dialog.open(LibraryComponent, {
      width: '700px',
    });*/
  }

  toggleMenu() {
    this.eventService.emitBoardMenuSideNavClickEvent();
  }

  toggleLayout() {
    this.eventService.emitBoardSideLayoutClickEvent();
  }

  logout() {
    sessionStorage.removeItem(environment.sessionToken);
    this.router.navigateByUrl('');
  }
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
];
