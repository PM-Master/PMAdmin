import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {AssociationsComponent} from './associations/associations.component';
import {ProhibitionsComponent} from './prohibitions/prohibitions.component';
import {NLPMComponent} from './nlpm/nlpm.component';
import {DashboardComponent} from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/nodes', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'associations', component: AssociationsComponent },
  { path: 'prohibitions', component: ProhibitionsComponent },
  { path: 'nlpm', component: NLPMComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
