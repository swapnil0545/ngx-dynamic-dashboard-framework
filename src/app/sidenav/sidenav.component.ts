import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { BoardService } from '../board/board.service';
import { Hiearchy, IBoard, IBoardCollection } from '../board/board.model';
import { EventService } from '../eventservice/event.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  @ViewChild('drawer') public drawer!: MatDrawer;
  @ViewChild('rightSideBar') public rightSideBar!: MatDrawer;
  boardData: IBoard[] = [];
  sidebar: string = '';

  showFiller = false;
  constructor(
    private eventService: EventService,
    private boardService: BoardService
  ) {
    this.loadBoards();
    this.setupEventListeners();
  }

  ngOnInit(): void {}

  toggleMenu() {
    this.drawer.toggle();
  }

  toggleRightBar(event: string) {
    this.rightSideBar.toggle();
    this.sidebar = event;
  }
  loadBoards() {
    this.boardService
      .getBoardCollection()
      .subscribe((boardCollection: IBoardCollection) => {
        this.boardData = boardCollection.boardList.filter((obj) => {
          return obj.relationship == Hiearchy.PARENT;
        });
      });
  }

  showBoard(boardList: any) {
    //raise event to show the selected board
    let boardSelected = boardList.selectedOptions.selected[0]?.value;

    this.eventService.emitBoardSelectedEvent({ data: boardSelected });
  }

  setupEventListeners() {
    this.eventService
      .listenForBoardMenuSideNavClickEvent()
      .subscribe((event) => {
        this.toggleMenu();
      });

    this.eventService.listenForBoardSideLayoutEvent().subscribe((event) => {
      this.toggleRightBar('layout');
    });

    this.eventService.listenForBoardSideToolbarEvent().subscribe((event) => {
      this.toggleRightBar('toolbar');
    });

    this.eventService
      .listenForBoardCreatedCompleteEvent()
      .subscribe((event) => {
        this.loadBoards();
      });
    this.eventService
      .listenForBoardDeletedCompleteEvent()
      .subscribe((event) => {
        this.loadBoards();
      });
    this.eventService
      .listenForBoardUpdateNameDescriptionRequestEvent()
      .subscribe((event) => {
        this.loadBoards();
      });
  }
}
