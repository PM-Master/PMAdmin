import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {PmService} from '../services/pm.service';
import {AlertService} from '../services/alert.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavComponent implements OnInit {

  ngOnInit() {

  }

  public logout() {
    console.log('logging out...');
    this.pm.logout();
  }
}
