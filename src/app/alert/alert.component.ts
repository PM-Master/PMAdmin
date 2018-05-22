import { Component, OnInit } from '@angular/core';
import {AlertService} from '../services/alert.service';
import {Alert, AlertType} from './alert';


@Component({
  moduleId: module.id,
  selector: 'app-alert',
  templateUrl: 'alert.component.html'
})

export class AlertComponent implements OnInit {
  alert: Alert = new Alert();

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.alertService.getAlert().subscribe((alert: Alert) => {
      if (!alert) {
        // clear alerts when an empty alert is received
        this.alert = null;
        return;
      }

      // add alert to array
      this.alert = (alert);
    });
  }

  removeAlert(alert: Alert) {
    this.alert = null; // this.alerts.filter(x => x !== alert);
  }

  cssClass(alert: Alert) {
    if (!alert) {
      return;
    }

    // return css class based on alert type
    switch (alert.type) {
      case AlertType.Success:
        return 'alert alert-success';
      case AlertType.Error:
        return 'alert alert-danger';
      case AlertType.Info:
        return 'alert alert-info';
      case AlertType.Warning:
        return 'alert alert-warning';
    }
  }
}
