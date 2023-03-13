import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfigurationModule } from '../configuration/configuration.module';
import { LibraryModule } from '../library/library.module';
import { RbacDirective } from '../_authorization/rbac.directive';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [MenuComponent, RbacDirective],
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatCheckboxModule,
    MatGridListModule,
    ConfigurationModule,
    MatDialogModule,
    LibraryModule,
    MatTooltipModule,
  ],
  exports: [MenuComponent],
  providers: [],
})
export class MenuModule {}
