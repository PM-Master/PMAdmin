import { Component, OnInit } from '@angular/core';
import {PmService} from "../services/pm.service";

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  nodes = [];
  selNode;
  access = [];
  constructor(private pmService: PmService) { }

  ngOnInit() {
    this.pmService.getObjects()
      .then(response => {
        this.nodes = response;

        this.pmService.getObjectAttributes()
          .then(response1 => {
            this.nodes = this.nodes.concat(response1);

            this.pmService.getUsers()
              .then(response2 => {
                this.nodes = this.nodes.concat(response2);
              });
          });
      });
  }

  setNode(node) {
    console.log(node);
    this.selNode = node;

    if (this.selNode.type === 'U') {
      this.pmService.getAccessibleNodes(this.selNode.name)
        .then(response => {
          console.log(response);
          this.access = response;
        });
    } else {
      this.pmService.getUsersPermissions(this.selNode)
        .then(response => {
          console.log(response);
          this.access = response;
        });
    }
  }
}
