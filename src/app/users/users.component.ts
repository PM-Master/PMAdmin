import { Component, OnInit } from '@angular/core';
import {PmService} from '../services/pm.service';
import {AlertService} from '../services/alert.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  model = {
    'name': '',
    'password': ''
  };
  uaModel = {
    'name': ''
  };
  selectedUser: any;
  selectedUA: any;
  users = [];
  uas = [];

  constructor(private pmService: PmService,
              private alertService: AlertService) { }

  ngOnInit() {
    this.pmService.getUsers()
      .then(response => {
        this.users = response;
      });
    this.pmService.getUserAttributes()
      .then(response => {
        this.uas = response;
      });
  }

  createUser() {
    this.pmService.createNodeWProps(this.model.name, 'U', [`password=${this.model.password}`])
      .then(response => {
        this.alertService.success(`Created User ${this.model.name}`);

        this.users.push(response);
      });
  }

  createUA() {
    this.pmService.createNodeWProps(this.uaModel.name, 'UA', [])
      .then(response => {
        this.alertService.success(`Create User Attribute ${this.uaModel.name}`);

        this.uas.push(response);
      });
  }

  setUser(user) {
    this.selectedUser = user;
  }

  setUA(ua) {
    this.selectedUA = ua;
  }

  deleteUser() {
    this.pmService.deleteNode(this.selectedUser.id)
      .then(response => {
        this.alertService.success('Successfully deleted User');

        this.pmService.getUsers()
          .then(response1 => {
            this.users = response1;
          });
      });
  }

  deleteUA() {
    this.pmService.deleteNode(this.selectedUA.id)
      .then(response => {
        this.alertService.success('Successfully deleted User Attribute');

        this.pmService.getUserAttributes()
          .then(response1 => {
            this.uas = response1;
          });
      });
  }

  assign() {
    this.pmService.assign(this.selectedUser.id, this.selectedUA.id)
      .then(response => {
        this.alertService.success(`Assigned ${this.selectedUser.name} to ${this.selectedUA.name}`);
      });
  }
}
