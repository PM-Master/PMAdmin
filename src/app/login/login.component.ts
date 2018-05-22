import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {PmService} from '../services/pm.service';
import {AlertService} from '../services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

  constructor(private pm: PmService,
              private router: Router,
              private alert: AlertService) { }

  ngOnInit() {
    this.pm.logout();
  }

  login(form: NgForm) {
    const username = form.value.username;
    const password = form.value.password;

    this.pm.login(username, password)
      .then(res => {
        this.router.navigate(['/nodes']);
      });
  }
}
