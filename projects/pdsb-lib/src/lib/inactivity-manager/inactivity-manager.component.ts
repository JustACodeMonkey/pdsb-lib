import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Idle } from '@ng-idle/core';

@Component({
    selector: 'pdsb-inactivity-manager',
    templateUrl: './inactivity-manager.component.html',
    styleUrls: ['./inactivity-manager.component.scss']
})
export class InactivityManagerComponent implements OnInit {

    static readonly CONTINUE = 'continue';
    static readonly LOGOUT   = 'logout';

    inactiveDisplay = '';
    timeoutDisplay  = '';

    idle: Idle = null;

    private _subscription: Subscription;

    constructor(
        @Inject(MAT_DIALOG_DATA) private _data,
        public _dialogRef: MatDialogRef<InactivityManagerComponent>
    ) {
        this._dialogRef.disableClose = true;
    }

    ngOnInit() {
        this.idle = this._data.idle;

        const inactiveSec = this.idle.getIdle();
        const timeoutSec  = this.idle.getTimeout();

        this.inactiveDisplay = Math.ceil(inactiveSec / 60) + ' minutes';
        this.timeoutDisplay  = timeoutSec + ' seconds';

        this._subscription = this.idle.onTimeoutWarning.subscribe((countdown: number) => {
            this.timeoutDisplay = countdown + ' seconds';
        });
    }

    ngOnDestroy() {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }
}
