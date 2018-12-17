import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataSet } from 'vis';
import { fromEvent } from 'rxjs';
import { pluck, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  server =
    'http://ec2-13-124-170-169.ap-northeast-2.compute.amazonaws.com:3000';

  constructor(private http: HttpClient) {}

  getDetailedAppMetrics(appId: string) {
    return this.getRMAppList().pipe(
      pluck('apps'),
      pluck('app'),
      map((appList: any[]) => {
        return appList.filter(app => app.id === appId)[0];
      })
    );
  }

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

  killApp(id: string) {
    return this.http.put(this.server + `/yarn/apps/${id}/state`, {});
  }

  getRegisteredApps() {
    return this.http.get(this.server + '/yarn/apps/registered');
  }

  registerNewApp(appName: string, da: any) {
    const depApp = da === '' ? null : da;
    return this.http.post(this.server + '/yarn/apps/registered', {
      appName,
      depApp
    });
  }

  unregisterApp(appId: number) {
    return this.http.delete(this.server + `/yarn/apps/registered/${appId}`);
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
