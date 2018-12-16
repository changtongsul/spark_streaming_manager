import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { concatMap } from 'rxjs/operators';
import { AppService } from './app.service';
import { Network } from 'vis';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('networkContainer')
  container;

  network: Network;
  networkData;

  metrics;
  info;

  apps;

  newAppName;
  newDepApp;

  clickedApp;
  clickedAppState;

  constructor(private app: AppService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.app.getRegisteredApps().subscribe(appList => {
      this.apps = appList;
      console.log(appList);
      this.networkData = this.app.parseNetworkData(this.apps);
      console.log(this.networkData);
      this.network = new Network(
        this.container.nativeElement,
        this.networkData,
        {}
      );
      this.app
        .getClickedNodes(this.network)
        .pipe(
          concatMap((node: number[]) => {
            if (node.length) {
              this.clickedApp = this.apps.filter(app => app.id === node[0])[0];
            } else {
              this.clickedApp = null;
            }
            console.log(this.clickedApp);
            if (this.clickedApp) {
              return this.app.getAppState(this.clickedApp.appId);
            } else {
              return of(null);
            }
          })
        )
        .subscribe((appState: any) => {
          if (appState) {
            this.clickedAppState = appState;
            console.log(appState);
          }
        });
    });
    this.app.getMetric().subscribe((metric: any) => {
      this.metrics = metric.clusterMetrics;
      console.log(metric);
    });
    this.app.getInfo().subscribe((info: any) => {
      this.info = info.clusterInfo;
      console.log(info);
    });
  }

  registerNewApp() {
    this.app
      .registerNewApp(this.newAppName, this.newDepApp)
      .subscribe((newApp: any) => {
        const nodes = this.networkData.nodes;
        const edges = this.networkData.edges;
        nodes.add({ id: newApp.id, label: newApp.appName });
        edges.add({ from: newApp.id, to: newApp.depApp });
        this.newAppName = '';
        this.newDepApp = '';
        this.app.getRegisteredApps().subscribe(apps => {
          this.apps = apps;
        });
      });
  }

  submitNewApp() {
    this.app.submitNewApp().subscribe(res => {
      console.log(res);
    });
  }
}
