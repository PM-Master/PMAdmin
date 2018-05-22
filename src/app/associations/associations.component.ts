import { Component, OnInit } from '@angular/core';
import {PmService} from '../services/pm.service';
import {AlertService} from '../services/alert.service';
import {PmNode} from '../model/pmnode';

@Component({
  selector: 'app-associations',
  templateUrl: './associations.component.html',
  styleUrls: ['./associations.component.css']
})
export class AssociationsComponent implements OnInit {
  assocUA: PmNode;
  assocOA: PmNode;
  assocModel: any = {};
  selectedAssociation: any;
  selectedAssociationOps: string;
  assocs = [];

  oas = [];
  uas = [];
  constructor(private pmService: PmService,
              private alertService: AlertService) { }

  ngOnInit() {
    this.pmService.getAssociations()
      .then(response => {
        this.assocs = response;
      });
    this.pmService.getUserAttributes()
      .then(response => {
        this.uas = response;
      });
    this.pmService.getObjectAttributes()
      .then(response => {
        this.oas = response;
      });
  }

  setAssocUA(node) {
    this.assocUA = node;
    console.log(this.assocUA);
  }

  setAssocOA(node) {
    this.assocOA = node;
  }

  createAssociation() {
    let ops = [];
    if (this.assocModel.ops !== null && this.assocModel.ops.length > 1) {
      ops = this.assocModel.ops.split('\n');
    }

    this.pmService.association(this.assocUA.id, this.assocOA.id, ops).then((response) => {
        this.alertService.success(`Successfully created association`);

        this.pmService.getAssociations()
          .then((assocs) => {
            this.assocs = assocs;
          });
        this.assocModel = {};
        this.assocOA = null;
        this.assocUA = null;
      }
    );
  }

  setAssociation(assoc) {
    this.selectedAssociation = assoc;

    this.selectedAssociationOps = assoc.ops.join('\n');
  }

  updateAssociation() {
    let ops = [];
    if (this.selectedAssociationOps !== null && this.selectedAssociationOps.length > 1) {
      ops = this.selectedAssociationOps.split('\n');
    }
    console.log(ops);
    this.pmService.updateAssociation(this.selectedAssociation.child.id, this.selectedAssociation.parent.id, ops)
      .then((response) => {
          this.alertService.success(`Successfully updated association`);

          this.pmService.getAssociations()
            .then((assocs) => {
              this.assocs = assocs;
            });
        }
      );
  }

  deleteAssociation() {
    this.pmService.deleteAssociation(this.selectedAssociation.parent.id, this.selectedAssociation.child.id)
      .then(res => {
        this.alertService.success(`Successfully deleted association between ${this.selectedAssociation.parent.name} to ${this.selectedAssociation.child.name}`);

        let index = this.assocs.indexOf(this.selectedAssociation, 0);
        if (index > -1) {
          this.assocs.splice(index, 1);
        }
        this.selectedAssociation = null;
      });
  }

}
