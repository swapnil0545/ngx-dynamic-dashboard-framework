import { Component, OnInit } from '@angular/core';
import { BoardService } from 'src/app/board/board.service';
import { EventService } from 'src/app/eventservice/event.service';
import { GadgetBase } from '../common/gadget-common/gadget-base/gadget.base';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.scss'],
})
export class CountComponent extends GadgetBase implements OnInit {
  count: number = 0;

  constructor(
    private eventService: EventService,
    private boardService: BoardService
  ) {
    super();
    //this.setDate();
  }

  ngOnInit(): void {
    this.setCount();
  }

  setCount() {
    this.propertyPages[0].properties.forEach((property) => {
      if (property.key == 'count') {
        console.log('count is: ' + this.count);
        this.count = property.value;
      }
    });
  }

  remove() {
    this.eventService.emitGadgetDeleteEvent({ data: this.instanceId });
  }

  propertyChangeEvent(propertiesJSON: string) {
    //update internal props
    const updatedPropsObject = JSON.parse(propertiesJSON);

    console.log(updatedPropsObject);

    if (updatedPropsObject.title != undefined) {
      this.title = updatedPropsObject.title;
    }
    if (updatedPropsObject.subtitle != undefined) {
      this.subtitle = updatedPropsObject.subtitle;
      console.log.apply(this.subtitle);
    }
    if (updatedPropsObject.count != undefined) {
      this.setCount();
    }

    //persist changes
    this.boardService.savePropertyPageConfigurationToDestination(
      propertiesJSON,
      this.instanceId
    );
  }
}
