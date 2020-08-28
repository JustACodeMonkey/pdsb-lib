import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PrintParams } from './print-params';
import { PrintStatus } from './print-status';
import { PrintServer } from './print-server';
import { ToolsService } from '../services/tools.service';

@Injectable({
    providedIn: 'root'
})
/**
 * Use the PrintManagerService to start / setup / monitor a print to the Oracle print servers
 * 1. Start by opening PrintManagerComponent from the page
 *    _dialog.open(PrintManagerComponent, {
 *        data: {
 *            reportId: 'THE_ORACLE_REPORT_ID'
 *        } as IPrintManagerData
 *    });
 * 2. Subscribe to the dialogReady Subject to let you know when the dialog is ready, 
 *    so you can start any data setup steps that are required (like generating the
 *    required temp table data, etc.)
 * 3. Call dataSetupComplete(printParams: PrintParams) when the data setup has completed
 *    to tell the PrintManagerComponent to start monitoring the Oracle print server to see if the
 *    requeseted report is ready to be opened
 */
export class PrintManagerService {

    private readonly api = '/angularprintapi/ws/';

    private _dialogReady: Subject<null>      = new Subject<null>();
    private _dataReady: Subject<PrintParams> = new Subject<PrintParams>();

    constructor(
        private _auth: AuthService,
        private _ts: ToolsService,
        private _http: HttpClient
    ) { }

    /**
     * Returns the reference to the _dialogReady Subject
     */
    get dialogReady() {
        return this._dialogReady;
    }

    /**
     * Returns the reference to the _dataReady Subject
     */
    get dataReady() {
        return this._dataReady;
    }

    /**
     * Called by the PrintManagerComponent so the service can notify the page/parent component
     * that the popup has been initialized
     * - At this point, the parent can do any data setup that is required 
     *   (the popup will be in PREPARING_DATA state)
     * - If no data setup is required, the parent can simply call dataReady to kick off the
     *   next step in the process
     */
    initComplete() {
        this._dialogReady.next();
    }

    /**
     * Called by the page/parent component to notify the PrintManagerComponent that the data
     * setup stage is complete
     * - At this point, the PrintManagerComponent can call startJob to start the print
     *   job on the Oracle print server
     * @param params The print parameters to pass to the Oracle report server
     */
    dataSetupComplete(params: PrintParams) {
        this._dataReady.next(params);
    }

    /**
     * Returns the PrintStatus to let us know if the job was started successfully
     * @param reportName - The name of the report to run
     * @param printParams - The parameters for the report
     */
    startJob(reportName: string, printParams: PrintParams): Observable<PrintStatus> {
        return new Observable<PrintStatus>(subscriber => {
            this._http
                .post<PrintStatus>(
                    `${this.api}report/${reportName}`,
                    printParams,
                    this._auth.headers
                )
                .subscribe({
                    next: (printStatus: PrintStatus) => {
                        subscriber.next(printStatus);
                        subscriber.complete();
                    },
                    error: (error: HttpErrorResponse) => {
                        this._ts.onSubscriberError(error, subscriber, new PrintStatus());
                    }
                });
        });
    }

    /**
     * Returns an updated PrintStatus to determine when the job is complete
     * @param jobNumber - The job number of the report
     * @param printServer - The server information for the job
     */
    checkJob(jobNumber: number, printServer: PrintServer): Observable<PrintStatus> {
        return new Observable<PrintStatus>(subscriber => {
            this._http
                .post<PrintStatus>(
                    `${this.api}job/${jobNumber}`,
                    printServer,
                    this._auth.headers
                )
                .subscribe({
                    next: (printStatus: PrintStatus) => {
                        subscriber.next(printStatus);
                        subscriber.complete();
                    },
                    error: (error: HttpErrorResponse) => {
                        this._ts.onSubscriberError(error, subscriber, new PrintStatus());
                    }
                });
        });
    }
}
