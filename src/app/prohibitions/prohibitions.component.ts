import { Component, OnInit } from '@angular/core';

import { PmService } from '../services/pm.service';
import {AlertService} from '../services/alert.service';
import {PmNode} from '../model/pmnode';
import {ActivatedRoute, Params} from '@angular/router';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-manage-prohibitions',
  templateUrl: './prohibitions.component.html',
  styleUrls: ['./prohibitions.component.css']
})

export class ProhibitionsComponent implements OnInit {
  pros: any;
  selPro: any;
  model: any = {};
  subs: PmNode[];
  resources: PmNode[];
  selSubject: PmNode;
  selRes: any;
  edit = false;
  show = false;
  constructor(private pmService: PmService,
              private route: ActivatedRoute,
              private alertService: AlertService) {
    this.model.selectedResources = [];
  }

  ngOnInit(): void {
    this.getProhibitions();
    this.pmService.getNodes(null, null, 'U', null, null)
      .then((nodes) => {
        this.subs = nodes;

        this.pmService.getNodes(null, null, 'UA', null, null)
          .then((nodes) => {
            if (nodes != null) {
              for (let x of nodes) {
                this.subs.push(x);
              }
            }
          });
      });
    this.pmService.getNodes(null, null, 'OA', null, null)
      .then((nodes) => {
        this.resources = nodes;
        console.log(this.resources);
      });
  }

  getProhibitions() {
    this.show = false;
    this.pmService.getProhibitions()
      .then(pros => {
        for (let pro of pros) {
          console.log(pro);
          // set subject node
          let node;
          if (pro.subject.subjectType === 'P') {
            node = {
              'name': pro.subject.subjectId,
              'type': 'P'
            };
          } else {
            this.pmService.getNode(pro.subject.subjectId)
              .then(response => {
                pro.subjectNode = response;
                console.log(pro.subjectNode);
              });
          }
          // set resourceNodes
          const resourceNodes = [];
          for (let res of pro.resources) {
            this.pmService.getNode(res.resourceId)
              .then(response => {
                node = response;
                resourceNodes.push(
                  {
                    'node': node,
                    'complement': res.complement
                  }
                );
              });
          }
          pro.resourceNodes = resourceNodes;
        }
        this.pros = pros;
        console.log(this.pros);
        this.show = true;
      });
  }

  getResourceNode(id) {
    let node;
    this.pmService.getNode(id)
      .then(res => {
        node = res;
      });
    return node;
  }

  setSubject(node: PmNode) {
    this.selSubject = node;
  }

  addResource(node: any) {
    console.log(node);
    node.complement = false;
    node.displayName = node.name;
    if (!this.inSelectedResources(node)) {
      this.model.selectedResources.push({
        'node': node,
        'complement': false
      });
    }
  }

  inSelectedResources(node: any) {
    for (let res of this.model.selectedResources) {
      if (res.node.id === node.id) {
        return true;
      }
    }

    return false;
  }

  reset() {
    this.model = {};
    this.selSubject = null;
    this.model.selectedResources = [];
    this.edit = false;
  }

  setComplement(res: any) {
    this.selRes = res;
    console.log(this.selRes);
    res.complement = !res.complement;
    console.log(this.model.selectedResources);
  }

  removeRes() {
    console.log(this.selRes);
    let index = 0;
    for (let res of this.model.selectedResources) {
      if (res.node.id === this.selRes.node.id) {
        this.model.selectedResources.splice(index, 1);
      }
      index++;
    }
  }

  resetSelPro() {
    this.edit = false;

    this.selPro = null;

    this.model.name = null;
    this.model.intersection = false;
    this.model.ops = '';

    this.selSubject = null;
    this.model.selectedResources = [];
  }

  createPro() {
    let ops = [];
    if (this.model.ops !== null && this.model.ops.length > 0) {
      console.log(this.model.ops);
      ops = this.model.ops.split('\n');
    }
    if (this.selSubject == null) {
      this.alertService.error('Prohibition subject was null');
    }

    let resources = [];
    for (let selRes of this.model.selectedResources) {
      resources.push({
        'resourceId': selRes.node.id,
        'complement': selRes.complement
      });
    }

    this.pmService.createProhibition(this.model.name, this.selSubject.type, this.selSubject.id,
      resources, ops, this.model.intersection)
      .then((res) => {
        this.alertService.success(`Successfully created Prohibition ${this.model.name}`);

        this.getProhibitions();
        this.reset();
      });
  }

  setPro(pro: any) {
    this.edit = true;

    console.log(pro);
    this.selPro = pro;

    this.model.name = pro.name;
    this.model.intersection = pro.intersection;
    this.model.ops = '';
    console.log(pro.operations);
    for (let op of pro.operations) {
      this.model.ops += op + '\n';
    }
    console.log(this.model.ops);

    this.selSubject = pro.subjectNode;
    this.model.selectedResources = [].concat(pro.resourceNodes);
    console.log(this.model.selectedResources);
  }

  deletePro() {
    this.pmService.deleteProhibition(this.selPro.name)
      .then(res => {
          this.alertService.success(`Successfully deleted Prohibition ${this.selPro.name}`);

          this.getProhibitions();
          this.reset();
          this.selPro = null;
        }
      );
  }

  updatePro() {
    console.log(this.pros);

    // convert ops to array
    let ops = [];
    if (this.model.ops !== null && this.model.ops.length > 0) {
      console.log(this.model.ops);
      const splitOps = this.model.ops.split('\n');
      for (const op of splitOps) {
        if (op.length) {
          ops.push(op);
        }
      }
    }
    console.log(ops);

    let resources = [];
    for (let selRes of this.model.selectedResources) {
      resources.push({
        'resourceId': selRes.node.id,
        'complement': selRes.complement
      });
    }

    console.log(this.model.intersection);
    // extract resource IDs and complement
    this.pmService.updateProhibition(this.model.name, this.selSubject.type, this.selSubject.id,
      resources, ops, this.model.intersection)
      .then((res) => {
        this.alertService.success(`Successfully updated Prohibition ${this.model.name}`);

        this.getProhibitions();
        this.reset();
        this.selRes = res;
      });
  }
}
