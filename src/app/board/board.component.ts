import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { IEvent, EventService } from '../eventservice/event.service';
import {
  BoardType,
  DashboardConfig,
  DashboardItemComponentInterface,
  Hiearchy,
  IBoard,
} from './board.model';
import { BoardService } from './board.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { IGadget } from '../gadgets/common/gadget-common/gadget-base/gadget.model';
import { UntypedFormControl } from '@angular/forms';
import { LayoutService } from '../layout/layout.service';
import { DisplayGrid, GridType } from 'angular-gridster2';
import { BarChartComponent } from '../gadgets/bar-chart/bar-chart.component';
import { AreaChartComponent } from '../gadgets/area-chart/area-chart.component';
import { GridsterItem } from 'angular-gridster2/public_api';
import { LibraryService } from '../library/library.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  animations: [
    trigger('showHide', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('500ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class BoardComponent implements OnInit {
  boardData!: IBoard;
  boardExists: boolean;
  boardHasGadgets: boolean;
  options!: DashboardConfig;
  private canDrop = true;
  public components: any = {
    BarChartComponent: BarChartComponent,
    AreaChartComponent: AreaChartComponent,
  };
  widgetItems!: IGadget[];
  emptyGadget!: Array<GridsterItem>;

  constructor(
    private eventService: EventService,
    private boardService: BoardService,
    private layoutService: LayoutService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    public libraryService: LibraryService,
    private router: Router
  ) {
    this.emptyGadget = [
      {
        x: 0,
        y: 0,
        rows: 1,
        cols: 2,
      },
    ];
    this.boardExists = false;
    this.boardHasGadgets = false;
    this.setupBoardEventListeners();
  }

  selected = new UntypedFormControl(0);
  selectedIndex: number | undefined;
  tabtitle: string = '';

  setSelected(val: number) {
    if (val < 0) {
      return;
    }
    this.displayNavSelectedBoard(this.boardData.tabs[val].id);
  }

  ngOnInit(): void {
    this.displayLastSelectedBoard();
    this.getOptions();
    this.getWidgetItems();
  }
  public getOptions() {
    //
    // There is some documentation re angular-gridster2's config properties in this file: gridsterConfig.constant.ts
    // See: https://github.com/tiberiuzuld/angular-gridster2/blob/master/projects/angular-gridster2/src/lib/gridsterConfig.constant.ts
    //

    this.options = {
      gridType: GridType.VerticalFixed,
      fixedColWidth: 105,
      fixedRowHeight: 105,
      displayGrid: DisplayGrid.OnDragAndResize,
      draggable: {
        enabled: true,
        ignoreContent: true,
        dropOverItems: true,
        dragHandleClass: 'drag-handler',
        ignoreContentClass: 'no-drag',
      },
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      emptyCellDropCallback: this.onDrop.bind(this),
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: true,
      enableEmptyCellDrag: false,
      itemResizeCallback: BoardComponent.itemResize,
      itemChangeCallback: this.itemChange.bind(this),
      minCols: 8,
      maxCols: 10,
      minRows: 10,
      maxRows: 20,
      resizable: { enabled: true },
      keepFixedHeightInMobile: true,
      useBodyForBreakpoint: true,
      setGridSize: true,
      swap: true,
      pushItems: false,
    };
  }
  /**
   * Event Listners
   */
  setupBoardEventListeners() {
    this.eventService
      .listenForBoardCreatedCompleteEvent()
      .subscribe((event: IEvent) => {
        this.displayLastSelectedBoard();
      });

    this.eventService
      .listenForBoardDeletedCompleteEvent()
      .subscribe((event: IEvent) => {
        this.displayLastSelectedBoard();
      });

    this.eventService
      .listenForBoardSelectedEvent()
      .subscribe((event: IEvent) => {
        this.displayNavSelectedBoard(event.data); //boardId
      });

    this.eventService
      .listenForLayoutChangeEvent()
      .subscribe((event: IEvent) => {
        this.layoutService.changeLayout(event, this.boardData);

        this.displayLastSelectedBoard();
      });

    this.eventService
      .listenForLibraryAddGadgetEvents()
      .subscribe((event: IEvent) => {
        /**
         * TODO - use different method here. We want to
         * save the board structure and reload it
         * instead of adding the gadget directly to the
         * display.
         */

        this.saveNewGadget(event.data); //IGadget
      });

    this.eventService
      .listenForGadgetPropertyChangeEvents()
      .subscribe((event: IEvent) => {
        this.displayLastSelectedBoard();
      });

    this.eventService.listenForGadgetDeleteEvent().subscribe((event) => {
      this.displayLastSelectedBoard();
    });

    this.eventService.listenForGadgetMaximizeEvent().subscribe((event) => {
      this.toggleGatdgetMaximize(event);
    });

    this.eventService
      .listenForBoardUpdateNameDescriptionRequestEvent()
      .subscribe((event) => {
        if (this.boardData.id === event.data['id']) {
          this.boardData.description = event.data['description'];
          this.boardData.title = event.data['title'];
        }
      });
  }

  private toggleGatdgetMaximize(eventDataGadgetInstanceId: IEvent) {
    //find board
    let idx = this.boardData.gadgets['findIndex'](
      (gadget2) => gadget2.instanceId === eventDataGadgetInstanceId.data
    );
    if (idx >= 0) {
      this.boardData.gadgets[idx].isMaximized =
        !this.boardData.gadgets[idx].isMaximized;
    }
    triggerWindowResize();
  }

  /**
   * Display last selected board
   * after the browser is launched or
   * if a new board is created. When a new board is created
   * that new board becomes the last selected board.
   */
  displayLastSelectedBoard() {
    //getBoardData
    this.boardService.getLastSelectedBoard().subscribe((boardData: IBoard) => {
      this.prepareBoardAndShow(boardData);
    });
  }

  /**
   * Display board based on navigation menu selection event
   */
  displayNavSelectedBoard(boardId: number) {
    //getBoardData
    this.boardService.getBoardById(boardId).subscribe((boardData: IBoard) => {
      this.prepareBoardAndShow(boardData);
      //reset tab to 0
      if (boardData.relationship === Hiearchy.PARENT) {
        //setTimeout(() => {
        this.selected.setValue(0);
        //this.selectedIndex = 0;
        //}, 0);
      }
    });
  }
  /**
   * Rudimentary board state management. this.boardData and this.boardExists
   * will determine what instructions/actions to display on the board.
   * @param boardData
   */
  prepareBoardAndShow(boardData: IBoard) {
    this.boardData = boardData;
    this.boardExists = this.doesABoardExist();
  }

  saveNewGadget(gadgetData: IGadget) {
    this.boardService.saveNewGadgetToBoard(this.boardData, gadgetData);
    this.displayLastSelectedBoard();
  }

  doesABoardExist() {
    return this.boardData.id != BoardType.EMPTYBOARDCOLLECTION; //TODO - Refactor this state. Move the state/condition from board to BoardCollection.
  }

  doesTheBoardHaveGadgets() {
    let gadgetCount = 0;
    this.boardData.gadgets.forEach((gadget) => {
      gadgetCount++;
    });

    return gadgetCount > 0;
  }
  openLibrary() {
    this.eventService.emitLibraryMenuOpenEvent();
  }

  getColumnIndexAsString(idx: number) {
    return '' + idx;
  }

  drop(event: CdkDragDrop<IGadget[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.boardService.updateBoardDueToDragAndDrop(this.boardData);
  }

  public getWidgetItems() {
    const subscription: Subscription = this.libraryService
      .getLibrary()
      .subscribe((data) => {
        this.widgetItems = data;
        console.info('toolPaletteItems: ' + JSON.stringify(this.widgetItems));

        subscription.unsubscribe();
      });
  }

  public getWidgettem(componentType: string): any {
    return this.widgetItems.find(
      (widgetItem: IGadget) => widgetItem.componentType === componentType
    );
  }

  public onDragEnter(event: any) {
    console.info('DashboardComponent: onDragEnter()');

    //
    // Deleting a widget (GridsterItem) leaves a gridster-preview behind
    // See: https://github.com/tiberiuzuld/angular-gridster2/issues/516
    //

    const gridsterPreviewElements =
      this.elementRef.nativeElement.getElementsByTagName('gridster-preview');

    // this.renderer.setStyle(gridsterPreview[0], 'display', 'block');
    this.renderer.setStyle(
      gridsterPreviewElements[0],
      'background',
      'rgba(0, 0, 0, .15)'
    );
  }

  public onDrop(event: any) {
    console.info('DashboardComponent: onDrop()');

    //
    // emptyCellDropCallback is called twice
    // See: https://github.com/tiberiuzuld/angular-gridster2/issues/513
    //

    console.info('DashboardComponent: canDrop === ' + this.canDrop);

    if (this.canDrop) {
      this.canDrop = false;

      const widgetComponentName =
        event.dataTransfer.getData('widgetIdentifier');

      const gadgetItem = this.getWidgettem(widgetComponentName);
      const widget: IGadget = { ...gadgetItem, cols: 4, rows: 4, y: 0, x: 0 };
      // update board gadget here
      //this.boardData.gadgets.push(widget);
      console.log('---> adding gadget');
      console.log(widget);
      this.eventService.emitLibraryAddGadgetEvent({ data: widget });

      setTimeout(() => {
        this.canDrop = true;
      }, 1000);
    }

    // console.info('Widget Id: ' + widgetId);
    // console.info('toolPaletteItem: ' + JSON.stringify(toolPaletteItem));
    // console.info('widget: ' + JSON.stringify(widget));
  }

  private itemChange(
    item: GridsterItem,
    itemComponent: DashboardItemComponentInterface
  ) {
    console.info('itemChanged', item, itemComponent);
    this.boardService.updateBoardDueToDragAndDrop(this.boardData);
    // this.eventService.emitBoardGadgetPropertyResizeEvent();
  }

  static itemResize(
    item: GridsterItem,
    itemComponent: DashboardItemComponentInterface
  ) {
    console.info('itemResized', item, itemComponent);

    triggerWindowResize();
    //this.eventService.emitBoardGadgetPropertyResizeEvent();
    // this.dashboardWidgetService.reflowWidgets();
  }

  public onDelete(item: any) {
    console.info('DashboardComponent: onDelete()');

    // this.items.splice(this.items.indexOf(item), 1);

    //
    // Deleting a widget (GridsterItem) leaves a gridster-preview behind
    // See: https://github.com/tiberiuzuld/angular-gridster2/issues/516
    //

    const gridsterPreviewElements =
      this.elementRef.nativeElement.getElementsByTagName('gridster-preview');

    // this.renderer.setStyle(gridsterPreview[0], 'display', 'none !important');
    this.renderer.setStyle(gridsterPreviewElements[0], 'background', '#fafafa');

    // this.logger.info('Widgets: ' + JSON.stringify(this.items));
  }

  public onSettings(item: any) {
    console.info('DashboardComponent: onSettings()');
    /*
    this.dialogService.openAlert({
      title: 'Alert',
      message: 'You clicked the Settings button.',
      closeButton: 'CLOSE'
    });*/
  }

  loadExistingBoard() {
    this.boardService.setBoardCollectionFromAPI();
    setTimeout(() => {
      this.reloadCurrentRoute();
    }, 100);
  }
  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
}
function triggerWindowResize() {
  window.dispatchEvent(new Event('resize')); // to reisize respective charts
}
