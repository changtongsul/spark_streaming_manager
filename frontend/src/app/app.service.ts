import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataSet } from 'vis';
import { fromEvent } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  server =
    'http://ec2-13-124-170-169.ap-northeast-2.compute.amazonaws.com:3000';

  constructor(private http: HttpClient) {}

  getClickedNodes(network) {
    return fromEvent(network, 'click').pipe(pluck('nodes'));
  }

  parseNetworkData(appList: any[]) {
    const nodes = new DataSet(
      appList.map(app => {
        return { id: app.id, label: app.appName };
      })
    );
    const edges = new DataSet(
      appList.map(app => {
        return { from: app.id, to: app.depApp ? app.depApp : 0 };
      })
    );
    return { nodes, edges };
  }

  getRMAppList() {
    return this.http.get(this.server + '/yarn/apps/rm');
  }

  submitNewApp() {
    return this.http.post(this.server + '/yarn/apps/rm', {});
  }

  getRegisteredApps() {
    return this.http.get(this.server + '/yarn/apps/registered');
  }

  registerNewApp(appName: string, depApp: number) {
    return this.http.post(this.server + '/yarn/apps/registered', {
      appName,
      depApp
    });
  }

  getMetric() {
    return this.http.get(this.server + '/yarn/cluster/metrics');
  }

  getAppState(id: string) {
    return this.http.get(this.server + `/yarn/apps/${id}/state`);
  }

  getInfo() {
    return this.http.get(this.server + '/yarn/cluster/info');
  }
}
