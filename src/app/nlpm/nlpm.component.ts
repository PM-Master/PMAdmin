import { Component, OnInit } from '@angular/core';
import {PmService} from '../services/pm.service';
import {AlertService} from '../services/alert.service';

@Component({
  selector: 'app-nlpm',
  templateUrl: './nlpm.component.html',
  styleUrls: ['./nlpm.component.css']
})
export class NLPMComponent implements OnInit {

  model = {
    'subjectId': 0,
    'operations': [],
    'opsStr': '',
    'targetIds': [],
    'pcId': 0
  };
  subjects = [];
  targets = [];
  pcs = [];

  constructor(private pmService: PmService,
              private alertService: AlertService) { }

  ngOnInit() {
    this.pmService.getUsers()
      .then(response => {
        this.subjects = response;

        this.pmService.getUserAttributes()
          .then(response1 => {
            this.subjects = this.subjects.concat(response1);
          });
      });
    this.pmService.getObjectAttributes()
      .then(response => {
        this.targets = response;
        this.pmService.getObjects()
          .then(response1 => {
            this.targets = this.targets.concat(response1);
          });
      });
    this.pmService.getPolicyClasses()
      .then(response => {
        this.pcs = response;
      });
  }

  doTarget(node) {
    console.log(this.model.targetIds);
    const index = this.model.targetIds.indexOf(node.id, 0);

    if (index > -1) {
      this.model.targetIds.splice(index, 1);
    } else {
      this.model.targetIds.push(node.id);
    }
  }

  submit() {
    this.model.operations = this.model.opsStr.split(/,\s*/);
    delete this.model.opsStr;
    this.pmService.nlpm(this.model)
      .then(response => {
        this.alertService.success('Success!');
        this.model = {
          'subjectId': 0,
          'operations': [],
          'opsStr': '',
          'targetIds': [],
          'pcId': 0
        };
      });

  }
}
