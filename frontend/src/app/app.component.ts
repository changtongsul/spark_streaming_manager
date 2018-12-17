import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { concatMap, mergeMap } from 'rxjs/operators';
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

  file;

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
              console.log(this.clickedApp);
              return this.app.getDetailedAppMetrics(this.clickedApp.appId);
            } else {
              this.clickedApp = null;
              return of(null);
            }
          })
        )
        .subscribe((appState: any) => {
          if (appState) {
            this.clickedAppState = appState;
            this.updateNodeColor(
              this.clickedApp.id,
              this.clickedAppState.state
            );
            console.log(appState);
          } else {
            if (this.clickedApp) {
              this.app.getAppState(this.clickedApp.appId).subscribe(state => {
                this.clickedAppState = state;
              });
            }
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

  initializeNetwork() {
    this.app.getRegisteredApps().subscribe(appList => {
      this.apps = appList;
      this.networkData = this.app.parseNetworkData(this.apps);
      this.network = new Network(
        this.container.nativeElement,
        this.networkData,
        {}
      );
      this.network.redraw();
      this.clickedApp = null;
      this.clickedAppState = null;
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

  unregister() {
    this.app.unregisterApp(this.clickedApp.id).subscribe(res => {
      console.log(res);
      this.initializeNetwork();
    });
  }

  submitNewApp() {
    this.app.submitNewApp().subscribe(res => {
      console.log(res);
    });
  }

  killApp() {
    this.app.killApp(this.clickedApp.appId).subscribe(res => {
      console.log(res);
    });
  }

  get submitDisable() {
    if (this.clickedAppState) {
      return this.clickedAppState.state !== 'NOT_SUBMITTED';
    } else {
      return true;
    }
  }

  get killDisable() {
    if (this.clickedAppState) {
      return (
        this.clickedAppState.state === 'FINISHED' ||
        this.clickedAppState.state === 'KILLED' ||
        this.clickedAppState.state === 'NOT_SUBMITTED'
      );
    } else {
      return true;
    }
  }

  fileChange(e) {
    console.log(e, this.file);
  }

  uploadFile() {
    alert('File successfully uploaded');
  }

  updateNodeColor(nodeId: number, state: string) {
    const node = this.networkData.nodes.get(nodeId);
    switch (state) {
      case 'FINISHED':
        node.color = {
          background: '#4286f4',
          border: '#0f213d',
          highlight: {
            background: '#4286f4',
            border: '#0f213d'
          }
        };
        this.networkData.nodes.update(node);
        break;
      case 'KILLED':
        node.color = {
          background: '#e02f1f',
          border: '#a02116',
          highlight: {
            background: '#e02f1f',
            border: '#a02116'
          }
        };
        this.networkData.nodes.update(node);
        break;
      case 'ACCEPTED':
      case 'RUNNING':
        node.color = {
          background: '#33c44b',
          border: '#20701f',
          highlight: {
            background: '#33c44b',
            border: '#20701f'
          }
        };
        this.networkData.nodes.update(node);
        break;
      default:
        break;
    }
  }
}
