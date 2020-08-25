import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertComponent } from '../components/alert/alert.component';
import { HttpErrorResponse } from '@angular/common/http';
import { IAlert } from '../components/alert/i-alert';
import { Subscriber } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
/**
 * The ToolsService is used to display generic alerts or application error alerts.
 * It can also be used to handle subscriber errors to return a default value
 */
export class ToolsService {

    /**
     * The defaul application error title and message
     */
    private _appErrorTitle = 'Application error';
    private _appErrorMsg   = 'The application server is currently unavailable.';

    constructor(
        private _dialog: MatDialog
    ) { }

    /**
     * Get and set the generic application error title and message
     */
    get appErrorTitle() {
        return this._appErrorTitle;
    }

    set appErrorTitle(title: string) {
        this._appErrorTitle = title;
    }

    get appErrorMsg() {
        return this._appErrorMsg;
    }

    set appErrorMsg(msg: string) {
        this._appErrorMsg = msg;
    }

    /**
     * Generic error message
     * @param title - The title to display
     * @param msg - The message to display
     * @param error - Optional error object (with message property) to display
     */
    genericError(title: string, msg: string, error?: HttpErrorResponse) {
        const content = msg + (error ? `<p>${error.message}</p>` : '');
        this._dialog.open(AlertComponent, {
            data: {
                title,
                message: content
            } as IAlert,
            disableClose: true
        } as MatDialogConfig);
    }

    /**
     * Displays an error using a MatDialog
     */
    onAppError(error: HttpErrorResponse) {
        this.genericError(this._appErrorTitle, this._appErrorMsg, error);
    }

    /**
     * Displays an error and completes a subscriber
     * @param error The HTTP error
     * @param subscriber The subscriber (if any) to send the value to and complete
     * @param val The value to send in the subscriber
     */
    onSubscriberError(error: HttpErrorResponse, subscriber?: Subscriber<any>, val?: any) {
        this.onAppError(error);
        if (subscriber) {
            subscriber.next(val);
            subscriber.complete();
        }
    }
}
