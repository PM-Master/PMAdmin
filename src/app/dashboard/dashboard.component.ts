import { Component, OnInit } from '@angular/core';
import {AlertService} from '../services/alert.service';
import {ActivatedRoute} from '@angular/router';
import {PmService} from '../services/pm.service';
import {PmNode} from '../model/pmnode';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  childNodes = [];
  parentNodes = [];
  childPath = [];
  parentPath = [];
  childNode;
  parentNode;
  lastSelectedNode: PmNode = null;
  createNodeModel = {
    'name': '',
    'type': '',
    'properties': ''
  };
  editNodeModel = {
    'id': 0,
    'name': '',
    'type': '',
    'properties': ''
  };
  allowedTypes = [];
  openedParentNode: any = {};
  openedChildNode: any = {};
  canAssign = false;
  canAssoc = false;
  canCreateNode = false;
  assocModel = {
    'operations': ''
  };
  assocs = [];
  childNodeAssocs = [];
  parentNodeAssocs = [];
  selectedAssociation: any = {};
  constructor(private pmService: PmService,
              private route: ActivatedRoute,
              private alertService: AlertService) { }

  ngOnInit() {
    let node = new PmNode(0, 'PM', 'C', null);
    this.childPath.push(node);
    this.parentPath.push(node);
    this.openParentNode(node);
    this.openChildNode(node);
    this.pmService.getAssociations()
      .then(response => {
        this.assocs = response;
      });
  }

  setChildPathNode(node) {
    if (node.id === 0) {
      this.childPath = this.childPath.slice(0, 1);
    } else {
      let newPath = [];
      for (let n of this.childPath) {
        if (n.id === node.id) {
          break;
        }
        newPath.push(n);
      }
      this.childPath = newPath;
    }

    this.openChildNode(node);
  }

  setParentPathNode(node) {
    console.log(node);
    if (node.id === 0) {
      this.parentPath = this.parentPath.slice(0, 1);
    } else {
      let newPath = [];
      for (let n of this.parentPath) {
        if (n.id === node.id) {
          break;
        }
        newPath.push(n);
      }
      this.parentPath = newPath;
    }

    this.openParentNode(node);
  }

  openChildNode(node: PmNode) {
    this.openedChildNode = node;
    this.setChild(node);
    if (node.id === 0) {
      this.pmService.getNodes(null, null, 'PC', null, null)
        .then((nodes) => {
          this.childNodes = nodes;
        });
    } else {
      if (node.type !== 'U' && node.type !== 'O') {
        this.pmService.getChildren(node.id)
          .then(response => this.childNodes = response);
        this.childPath.push(node);
      }
    }
  }

  openParentNode(node: PmNode) {
    console.log(node);
    this.openedParentNode = node;
    this.setParent(node);
    if (node.id === 0) {
      this.pmService.getNodes(null, null, 'PC', null, null)
        .then((nodes) => {
          this.parentNodes = nodes;
        });
    } else {
      if (node.type !== 'U' && node.type !== 'O') {
        this.pmService.getChildren(node.id)
          .then(response => this.parentNodes = response);
        this.parentPath.push(node);
      }
    }
  }

  updateParentNodes(node) {
    if (node.id === 0) {
      this.pmService.getNodes(null, null, 'PC', null, null)
        .then((nodes) => {
          this.parentNodes = nodes;
        });
    } else {
      this.pmService.getChildren(node.id)
        .then(response => this.parentNodes = response);
    }
  }

  updateChildNodes(node) {
    console.log(node);
    if (node.id === 0) {
      this.pmService.getNodes(null, null, 'PC', null, null)
        .then((nodes) => {
          this.childNodes = nodes;
        });
    } else {
      this.pmService.getChildren(node.id)
        .then(response => this.childNodes = response);
    }
  }

  setChild(node) {
    this.childNode = node;
    this.setEditNodeModel(node);
    console.log(this.editNodeModel);

    // check if can assign
    if ((!this.parentNode && !this.childNode) || (this.parentNode.id === 0 || this.childNode.id === 0)) {
      this.canAssign = false;
    } else if (node.type === 'PC') {
      this.canAssign = false;
    } else if (node.type === 'OA') {
      this.canAssign = this.parentNode.type === 'PC' || this.parentNode.type === 'OA';
    } else if (node.type === 'O') {
      this.canAssign = this.parentNode.type === 'OA';
    } else if (node.type === 'UA') {
      this.canAssign = this.parentNode.type === 'PC' || this.parentNode.type === 'UA';
    } else if (node.type === 'U') {
      this.canAssign = this.parentNode.type === 'UA';
    }

    this.canAssoc = this.childNode.type === 'UA' && this.parentNode.type === 'OA';

    this.setLastSelectedNode(node);
    this.setAllowedTypes(node);

    this.setChildAssociations();
  }

  setParent(node) {
    this.parentNode = node;
    this.setEditNodeModel(node);

    // check if can assign
    if ((!this.parentNode && !this.childNode) || (this.parentNode.id === 0 || this.childNode.id === 0)) {
      this.canAssign = false;
    } else if (this.parentNode.type === 'PC') {
      this.canAssign = this.childNode.type === 'OA' || this.childNode.type === 'UA';
    } else if (this.parentNode.type === 'OA') {
      this.canAssign = this.childNode.type === 'OA' || this.childNode.type === 'O';
    } else if (this.parentNode.type === 'O') {
      this.canAssign = false;
    } else if (this.parentNode.type === 'UA') {
      this.canAssign = this.childNode.type === 'U' || this.childNode.type === 'UA';
    } else if (this.parentNode.type === 'U') {
      this.canAssign = false;
    }

    // check if can assoc
    if ((!this.parentNode && !this.childNode) || (this.parentNode.id === 0 || this.childNode.id === 0)) {
      this.canAssoc = false;
    } else {
      this.canAssoc = this.childNode.type === 'UA' && this.parentNode.type === 'OA';
    }

    this.setLastSelectedNode(node);
    this.setAllowedTypes(node);

    this.setParentAssociations();
  }

  setSelectedAssociation(assoc) {
    this.selectedAssociation = assoc;
    this.assocModel.operations = assoc.ops.join('\n');
  }

  setChildAssociations() {
    this.selectedAssociation = {'child': {}, 'parent': {}, 'ops': []};

    this.childNodeAssocs = [];
    for (let assoc of this.assocs) {
      if (assoc.child.id === this.childNode.id ||
        assoc.parent.id === this.childNode.id) {
        this.childNodeAssocs.push(assoc);
      }
    }
  }

  setParentAssociations() {
    this.selectedAssociation = {'child': {}, 'parent': {}, 'ops': []};

    this.parentNodeAssocs = [];
    for (let assoc of this.assocs) {
      if (assoc.parent.id === this.parentNode.id ||
        assoc.child.id === this.parentNode.id) {
        this.parentNodeAssocs.push(assoc);
      }
    }
  }

  setAllowedTypes(node) {
    switch (node.type) {
      case 'PC':
        this.allowedTypes = ['OA', 'UA'];
        break;
      case 'OA':
        this.allowedTypes = ['OA', 'O'];
        break;
      case 'UA':
        this.allowedTypes = ['UA', 'U'];
        break;
      case 'O':
        this.allowedTypes = [];
        break;
      case 'U':
        this.allowedTypes = [];
        break;
      case 'C':
        this.allowedTypes = ['PC'];
        break;
    }
  }

  setLastSelectedNode(node) {
    this.lastSelectedNode = node;
    this.canCreateNode = node.type !== 'O' && node.type !== 'U';
  }

  setEditNodeModel(node) {
    if (node.id !== 0) {
      this.editNodeModel.id = node.id;
      this.editNodeModel.name = node.name;
      this.editNodeModel.type = node.type;
      let props = '';
      for (let prop of node.properties) {
        props += prop['key'] + '=' + prop['value'] + '\n';
      }
      this.editNodeModel.properties = props;
    }
  }

  createNode() {
    let props = [];
    if (this.createNodeModel.properties != null) {
      if (this.createNodeModel.properties.length > 1) {
        props = this.createNodeModel.properties.split('\n');
      }
    }

    if (this.createNodeModel.type.length === 0) {
      this.createNodeModel.type = this.allowedTypes[0];
    }
    this.pmService.createNodeWProps(this.createNodeModel.name, this.createNodeModel.type, props)
      .then((response) => {
        if (this.lastSelectedNode.id !== 0) {
          this.pmService.assign(response.id, this.lastSelectedNode.id)
            .then(response1 => {
              this.alertService.success(`Successfully created ${response.name} and assigned it to ${this.lastSelectedNode.name}`);
              this.updateParentNodes(this.openedParentNode);
              this.updateChildNodes(this.openedChildNode);
            });
        } else {
          this.alertService.success(`Successfully created ${response.name}`);
          this.updateParentNodes(this.openedParentNode);
          this.updateChildNodes(this.openedChildNode);
        }
        this.resetCreateNodeModel();
      });
  }

  resetCreateNodeModel() {
    this.createNodeModel = {
      'name': '',
      'type': '',
      'properties': ''
    };
  }

  resetEditNodeModel() {
    this.editNodeModel = {
      'id': 0,
      'name': '',
      'type': '',
      'properties': ''
    };
  }

  editNode() {
    let finalProps = [];
    let propsArr = this.editNodeModel.properties.split('\n');
    for (let propStr of propsArr) {
      let prop = propStr.split('=');
      if (prop.length === 2) {
        let propObj = {
          'key': prop[0],
          'value': prop[1]
        };
        finalProps.push(propObj);
      }
    }

    this.pmService.updateNode(new PmNode(this.editNodeModel.id, this.editNodeModel.name, this.editNodeModel.type, finalProps))
      .then(response => {
        this.alertService.success(`Successfully updated ${this.editNodeModel.name}`);
        this.resetEditNodeModel();
        this.updateParentNodes(this.openedParentNode);
        this.updateChildNodes(this.openedChildNode);
      });
  }

  setModel(node) {
    let propertiesStr = '';
    for (const prop of node.properties) {
      propertiesStr += `${prop.key}=${prop.value}\n`;
    }
    this.editNodeModel = {
      'id': node.id,
      'name': node.name,
      'type': node.type,
      'properties': propertiesStr
    };
  }

  deleteNode() {
    this.pmService.deleteNode(this.lastSelectedNode.id)
      .then(response => {
        this.alertService.success(`Successfully deleted ${this.lastSelectedNode.name}`);
        this.lastSelectedNode = null;
        this.updateParentNodes(this.openedParentNode);
        this.updateChildNodes(this.openedChildNode);
        this.setParent(this.openedParentNode);
        this.setChild(this.openedChildNode);
      });
  }

  assign() {
    console.log(this.childNode);
    if (this.childNode.id === this.parentNode.id) {
      this.alertService.error('Cannot assign node to itself');
    } else {
      this.pmService.assign(this.childNode.id, this.parentNode.id)
        .then(response => {
          this.alertService.success(`Successfully assigned ${this.childNode.name} to ${this.parentNode.name}`);

          this.updateParentNodes(this.openedParentNode);
          this.updateChildNodes(this.openedChildNode);
        });
    }
  }

  deassign() {
    this.pmService.deassign(this.childNode.id, this.parentNode.id)
      .then(response => {
        this.alertService.success(`Successfully deleted assignment between ${this.childNode.name} and ${this.parentNode.name}`);

        this.updateParentNodes(this.openedParentNode);
        this.updateChildNodes(this.openedChildNode);
      });
  }

  createAssociation() {
    let ops = [];
    if (this.assocModel.operations !== null && this.assocModel.operations.length > 1) {
      ops = this.assocModel.operations.split('\n');
    }

    this.pmService.association(this.childNode.id, this.parentNode.id, ops)
      .then((response) => {
          this.alertService.success(`Successfully created association between ${this.childNode.name} and ${this.parentNode.name}`);
          this.assocs.push({'child': this.childNode, 'parent': this.parentNode, 'ops': ops});
          this.setChildAssociations();
          this.setParentAssociations();

          this.assocModel = {'operations': ''};
        }
      );
  }

  updateAssociation() {
    let ops = [];
    if (this.assocModel.operations !== null && this.assocModel.operations.length > 1) {
      ops = this.assocModel.operations.split('\n');
    }
    console.log(ops);
    this.pmService.updateAssociation(this.selectedAssociation.child.id, this.selectedAssociation.parent.id, ops)
      .then((response) => {
          this.alertService.success(`Successfully updated association`);

          this.pmService.getAssociations()
            .then((assocs) => {
              this.assocs = assocs;

              this.setChildAssociations();
              this.setParentAssociations();
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
        this.selectedAssociation = {'child': {}, 'parent': {}, 'ops': []};
        this.setChildAssociations();
        this.setParentAssociations();
      });
  }
}
