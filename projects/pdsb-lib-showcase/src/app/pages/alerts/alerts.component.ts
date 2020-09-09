import { Component, OnInit } from '@angular/core';
import { ToolsService } from 'projects/pdsb-lib/src/lib/services/tools.service';

@Component({
    selector: 'app-alerts',
    templateUrl: './alerts.component.html',
    styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {

    constructor(
        private _ts: ToolsService
    ) { }

    ngOnInit(): void {
    }

    genericError() {
        this._ts.genericError('Title', 'Error message');
    }

    genericConfirm() {
        this._ts
            .genericConfirm('Title', 'Error message', 'Button1', 'Button2')
            .afterClosed()
            .subscribe({
                next: (txt: string) => {
                    console.log(txt);
                }
            });
    }

    genericChoice() {
        this._ts
            .genericChoice('Title', 'Choice', 'Button1', 'Button2', 'Button3')
            .afterClosed()
            .subscribe({
                next: (txt: string) => {
                    console.log(txt);
                }
            });
    }
}
