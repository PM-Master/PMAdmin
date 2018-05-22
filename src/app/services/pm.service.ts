import { Injectable } from '@angular/core';
import {Headers, Http, URLSearchParams} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { PmNode } from '../model/pmnode';
import {AccessEntry} from '../model/AccessEntry';
import {Router} from '@angular/router';
import {AlertService} from './alert.service';
import {Association} from '../model/Association';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable()
export class PmService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private nodesUrl = 'http://localhost:8080/pm/api/nodes';
  private assignmentsUrl = 'http://localhost:8080/pm/api/assignments';
  private associationsUrl = 'http://localhost:8080/pm/api/associations';
  private permissionsUrl = 'http://localhost:8080/pm/api/permissions';
  private configUrl = 'http://localhost:8080/pm/api/configuration';
  private kernelUrl = 'http://localhost:8080/pm/api/kernel';
  private proUrl = 'http://localhost:8080/pm/api/prohibitions';
  private evrUrl = 'http://localhost:8080/pm/api/evr';
  private sessionUrl = 'http://localhost:8080/pm/api/sessions';

  public SUCCESS_CODE = 9000;

  constructor(private http: HttpClient,
              private alertService: AlertService) { }


  get(url: string, params: URLSearchParams) {
    if (params === null) {
      params = new URLSearchParams();
    }
    params.set('session', localStorage.getItem('SESSION_ID'));

    return this.http
      .get(`${url}?${params.toString()}`)
      .toPromise()
      .then(response => {
        return this.doResponse(response);
      });
  }

  post(url: string, data: any) {
    const params = new URLSearchParams();
    params.set('session', localStorage.getItem('SESSION_ID'));
    return this.http
      .post(`${url}?${params}`, data, this.headers)
      .toPromise()
      .then(response => {
        return this.doResponse(response);
      });
  }

  put(url: string, data: any) {
    console.log(data);
    const params = new URLSearchParams();
    params.set('session', localStorage.getItem('SESSION_ID'));
    return this.http
      .put(`${url}?${params}`, data, this.headers)
      .toPromise()
      .then(response => {
        return this.doResponse(response);
      });
  }

  delete(url: string, params) {
    if (params === null) {
      params = new URLSearchParams();
    }
    params.set('session', localStorage.getItem('SESSION_ID'));
    return this.http.delete(`${url}?${params}`, this.headers)
      .toPromise()
      .then(response => {
        return this.doResponse(response);
      });
  }

  doResponse(response) {
    if (response['code'] !== this.SUCCESS_CODE) {
      this.alertService.error(response['message']);
      throw new Error(response['message']);
    } else {
      return response;
    }
  }

  getProhibitions() {
    return this.get(this.proUrl, null)
      .then((response) => response['entity']);
  }

  getGraph() {
    return this.get(`${this.configUrl}/graph`, null)
      .then((response) => response['entity']);
  }

  getUserGraph() {
    return this.get(`${this.configUrl}/graph/users`, null)
      .then((response) => response['entity']);
  }

  getObjGraph() {
    return this.get(`${this.configUrl}/graph/objects`, null)
      .then((response) => response['entity']);
  }
  createAssociation(uaId: number, targetId: number, ops: string[]) {
    const data = {
      'uaId': uaId,
      'targetId': targetId,
      'ops': ops,
      'inherit': true
    };

    return this.post(this.associationsUrl, data)
      .then((response) => response['entity']);
  }

  deleteProhibition(name: string) {
    return this.delete(`${this.proUrl}/${name}`, null)
      .then((response) => response['entity']);
  }

  createProhibition(name: string, subjectType: string, subjectId: number, resources: any,
                    operations: string[], intersection: boolean) {
    const data = {
      'name': name,
      'intersection': intersection,
      'operations': operations,
      'resources': resources,
      'subject': {
        'subjectId': subjectId,
        'subjectType': subjectType
      }
    };

    return this.post(this.proUrl, data)
      .then((response) => response['entity']);
  }

  updateProhibition(name: string, subjectType: string, subjectId: number, resources: any,
                    operations: string[], intersection: boolean) {
    const data = {
      'name': name,
      'intersection': intersection,
      'operations': operations,
      'resources': resources,
      'subject': {
        'subjectId': subjectId,
        'subjectType': subjectType
      }
    };

    return this.put(`${this.proUrl}/${name}`, data)
      .then((response) => response['entity']);
  }

  updateAssociation(uaId: number, targetId: number, ops: string[]) {
    const data = {
      'uaId': uaId,
      'targetId': targetId,
      'ops': ops,
      'inherit': true
    };

    return this.put(`${this.associationsUrl}/${targetId}`, data)
      .then((response) => response['entity']);
  }

  createNode(name: string, type: string) {
    const data = {
      'name': name,
      'type': type
    };
    return this.post(this.nodesUrl, data)
      .then((response) => response['entity']);
  }

  createNodeWProps(name: string, type: string, props: string[]) {
    let propsArr: {key: string, value: string}[] = [];
    for (let prop of props){
      let propArr = prop.split('=');
      if (propArr.length === 2) {
        propsArr.push({'key': propArr[0] , 'value': propArr[1]});
      }
    }
    const data = {
      'name': name,
      'type': type,
      'properties': propsArr
    };

    return this.post(this.nodesUrl, data)
      .then((response) => response['entity']);
  }

  assign(childId: number, parentId: number) {
    const data = {
      'childId': childId,
      'parentId': parentId
    };
    return this.post(`${this.assignmentsUrl}`, data)
      .then((response) => response['entity']);
  }

  deassign(childId, parentId) {
    let params: URLSearchParams = new URLSearchParams();
    params.set('childId', childId);
    params.set('parentId', parentId);
    return this.delete(`${this.assignmentsUrl}`, params)
      .then((response) => response['entity']);
  }

  association(childId: number, parentId: number, ops: string[]) {
    const data = {
      'uaId': childId,
      'targetId': parentId,
      'ops': ops,
      'inherit': true
    };
    return this.post(`${this.associationsUrl}`, data)
      .then((response) => response['entity']);
  }

  deleteAssociation(targetId: number, uaId: number) {
    return this.delete(`${this.associationsUrl}/${targetId}/subjects/${uaId}`, null)
      .then((response) => response['entity']);
  }

  getNodes(namespace: string, name: string, type: string, key: string, value: string) {
    let params: URLSearchParams = new URLSearchParams();
    params.set('namespace', namespace);
    params.set('name', name);
    params.set('type', type);
    params.set('key', key);
    params.set('value', value);
    console.log(params);
    return this.get(this.nodesUrl, params)
      .then((response) => response['entity']);
  }

  getPolicyClasses() {
    return this.getNodes(null, null, 'PC', null, null);
  }
  getObjectAttributes() {
    return this.getNodes(null, null, 'OA', null, null);
  }
  getObjects() {
    return this.getNodes(null, null, 'O', null, null);
  }
  getUserAttributes() {
    return this.getNodes(null, null, 'UA', null, null);
  }
  getUsers() {
    return this.getNodes(null, null, 'U', null, null);
  }

  getAssociations() {
    return this.get(`${this.associationsUrl}`, null)
      .then((response) => response['entity']);
  }

  public getNode(id: number) {
    const url = `${this.nodesUrl}/${id}`;
    return this.get(url, null)
      .then((response) => response['entity']);
  }

  getChildren(id: number) {
    const url = `${this.nodesUrl}/${id}/children`;
    return this.get(url, null)
      .then((response) => response['entity']);
  }

  getChildrenOfType(id: number, type: string) {
    const url = `${this.nodesUrl}/${id}/children`;
    let params: URLSearchParams = new URLSearchParams();
    params.set('type', type);
    return this.get(url, params)
      .then((response) => response['entity']);
  }

  getParents(id: number) {
    const url = `${this.nodesUrl}/${id}/parents`;
    return this.get(url, null)
      .then((response) => response['entity']);
  }

  deleteNode(id: number) {
    const url = `${this.nodesUrl}/${id}`;
    return this.delete(url, null)
      .then((response) => response['entity']);
  }

  updateNode(node: PmNode) {
    const url = `${this.nodesUrl}/${node.id}`;
    console.log(JSON.stringify(node));
    return this.put(url, node)
      .then((response) => response['entity']);
  }

  public login(username: string, password: string) {
    const data = {
      'username': username,
      'password': password
    };

    return this.post(this.sessionUrl, data)
      .then(response => {
        const sessionId = response['entity'];
        localStorage.setItem('SESSION_ID', sessionId);
        return sessionId;
      });
  }

  public logout() {
    const sessionId = localStorage.getItem('SESSION_ID');
    if (sessionId !== null) {
      this.delete(`${this.sessionUrl}/${sessionId}`, null);
    }
  }

  nlpm(model) {
    return this.post('http://localhost:8080/pm/api/nlpm', model);
  }
}

