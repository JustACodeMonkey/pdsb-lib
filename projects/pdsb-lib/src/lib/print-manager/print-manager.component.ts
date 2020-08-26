import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { PrintStatus } from './print-status';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';
import { PrintManagerService } from './print-manager.service';
import { PrintParams } from './print-params';
import { AppService } from '../services/app.service';
import { IPrintManagerData } from './i-print-manager-data';

/** @dynamic */
@Component({
    selector: 'pdsb-print-manager',
    templateUrl: './print-manager.component.html',
    styleUrls: ['./print-manager.component.scss']
})
export class PrintManagerComponent implements OnInit, OnDestroy {

    msg      = '';
    title    = 'Generating report';
    waitTime = 0;

    // For the buttons
    readyToOpen   = false;
    errorOrFailed = false;

    private _rechecking = false;
    private _reportId   = '';
    private _base       = '';
    private _srv        = '';

    private _interval: Subscription;
    private _waiting: Subscription;
    private _printStatus: PrintStatus;

    private _dataSetupComplete: Subscription;
    
    constructor(
        private _as: AppService,
        private _ps: PrintManagerService,
        private _dialogRef: MatDialogRef<PrintManagerComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: IPrintManagerData,
        @Inject(DOCUMENT) private _doc: Document
    ) {
        this._dialogRef.disableClose = true;
        this._reportId               = this._data.reportId;
    }

    ngOnInit(): void {
        this.startWaiting();
        this.waitForDataSetup();
        this._ps.initComplete();
    }

    ngOnDestroy() {
        this.stopWaiting();
        this.stopInterval();
        if (this._dataSetupComplete) {
            this._dataSetupComplete.unsubscribe();
            this._dataSetupComplete = null;
        }
    }

    /**
     * Called from the open button when the report generation is complete and the user wants to open the report
     */
    onOpenReport() {
        this.createFormAndSubmit();
        this.onClose();
    }

    /**
     * Called to re-attempt the report generation
     */
    onTryAgain() {
        this._ps.initComplete();
    }

    onClose() {
        this._dialogRef.close();
    }

    /**
     * When an error occurs, we update the message and stop our timers
     */
    private onReportError() {
        this.msg   = 'An error has occurred and the report was not able to be generated.';
        this.title = 'Report error';
        // Show the button to retry / close and stop the interval
        this.errorOrFailed = true;
        this.stopWaiting();
        this.stopInterval();
    }

    /**
     * Starts the report generation process on the Oracle print server
     * @param params The parameters to pass to the Oracle print server
     */
    private generate(params: PrintParams) {
        this.errorOrFailed  = false;
        this.readyToOpen    = false;
        this.msg            = '';
        this.title          = 'Generating report';
        // Start the print job
        this._ps
            .startJob(this._reportId, params)
            .subscribe({
                next: (printStatus: PrintStatus) => {
                    const status = printStatus.status;
                    if (status === PrintStatus.STATUS_FAILED || status >= PrintStatus.STATUS_ERROR) {
                        this.onReportError();
                    } else {
                        this._printStatus = printStatus;
                        this.startInterval();
                    }
                }
            });
    }

    /**
     * An interval to keep track of how long the print process has been occurring
     */
    private startWaiting() {
        this.stopWaiting();
        this._waiting = interval(1000).subscribe({
            next: (i: number) => {
                this.waitTime += 1;
            }
        });
    }

    /**
     * Stops the overal time interval and resets the timer to 0
     */
    private stopWaiting() {
        if (this._waiting) {
            this._waiting.unsubscribe();
            this._waiting = null;
            this.waitTime = 0;
        }
    }

    /**
     * Starts the interval to check to see if the Oracle print server is done with the report
     */
    private startInterval() {
        this._interval = interval(3000).subscribe({
            next: (i: number) => {
                if (this._rechecking) {
                    return;
                }
                this._rechecking = true;
                this._ps
                    .checkJob(this._printStatus.jobId, this._printStatus.server)
                    .subscribe({
                        next: (printStatus: PrintStatus) => {
                            const status = printStatus.status;
                            if (status === PrintStatus.STATUS_FAILED || status >= PrintStatus.STATUS_ERROR) {
                                this.onReportError();
                            } else if (status === PrintStatus.STATUS_READY) {
                                // Get the report URL
                                this.msg    = 'The report is ready and will be available for four minutes. If it did not open automatically, click the button below to open the report.';
                                this.title  = 'Report ready';
                                const base  = `https://${this._as.isProd ? 'gweb11' : 'devweb2'}.peelschools.org/reports/rwservlet/getjobid`;
                                this._base  = `${base}${printStatus.jobId}/${this._reportId}`;
                                this._srv   = printStatus.server.name;

                                // Show the button to open the report and stop the interval
                                this.readyToOpen = true;
                                this.stopInterval();
                                this.stopWaiting();

                                this.createFormAndSubmit();
                            } else {
                                this.msg = '';
                            }
                            this._rechecking = false;
                        }
                    });
            }
        });
    }

    /**
     * Stops the interval that checks the Oracle print server for completion
     */
    private stopInterval() {
        if (this._interval) {
            this._interval.unsubscribe();
            this._interval = null;
        }
    }

    /**
     * Creates a form and submits it to get the report
     */
    private createFormAndSubmit() {
        const ID = 'tempPrintForm';
        this.removeForm(this._doc.getElementById(ID) as HTMLFormElement);

        const form: HTMLFormElement = this._doc.createElement('form');
        form.id = ID;
        form.method = 'POST';
        form.action = '/angularprintapi/get/pdf';
        form.target = '_blank';

        const hBase: HTMLInputElement = this._doc.createElement('input');
        hBase.type = 'hidden';
        hBase.name = 'baseUrl';
        hBase.value = this._base;

        const hSrv: HTMLInputElement = this._doc.createElement('input');
        hSrv.type = 'hidden';
        hSrv.name = 'server';
        hSrv.value = this._srv;

        form.appendChild(hBase);
        form.appendChild(hSrv);

        this._doc.body.appendChild(form);
        (this._doc.getElementById(ID) as HTMLFormElement).submit();
        this.removeForm(form);
    }

    /**
     * Ensures the form doesn't already exist on the page
     * @param form The form element to remove
     */
    private removeForm(form: HTMLFormElement) {
        if (form) {
            this._doc.body.removeChild(form);
        }
    }

    /**
     * Waits for the data setup stage to complete in the page/parent component,
     * then calls the generate method
     */
    private waitForDataSetup() {
        this._dataSetupComplete = this._ps.dataReady.subscribe({
            next: (params: PrintParams) => {
                this.generate(params);
            }
        });
    }
}
