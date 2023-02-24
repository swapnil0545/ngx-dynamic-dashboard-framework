import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './board.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BoardService } from './board.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { GadgetsModule } from '../gadgets/gadgets.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { GridsterModule } from 'angular-gridster2';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { DynamicModule } from 'ng-dynamic-component';
@NgModule({
  declarations: [BoardComponent],
  imports: [
    CommonModule,
    DragDropModule,
    MatGridListModule,
    MatToolbarModule,
    MatIconModule,
    DynamicModule,
    GadgetsModule,
    MatDividerModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    GridsterModule,
  ],
  exports: [BoardComponent],
  providers: [BoardService],
})
export class BoardModule {}
