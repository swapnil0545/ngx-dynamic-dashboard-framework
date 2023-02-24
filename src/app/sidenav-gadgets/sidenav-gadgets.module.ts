import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavGadgetsComponent } from './sidenav-gadgets.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BoardModule } from '../board/board.module';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { SidelayoutModule } from '../layout/layout.module';

@NgModule({
  declarations: [SidenavGadgetsComponent],
  imports: [CommonModule, MatSidenavModule, BoardModule, MatListModule,MatButtonModule, SidelayoutModule],
  exports: [SidenavGadgetsComponent],
})
export class SidenavGadgetsModule {}
