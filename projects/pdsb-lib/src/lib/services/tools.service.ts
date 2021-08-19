import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AlertComponent } from '../components/alert/alert.component';
import { HttpErrorResponse } from '@angular/common/http';
import { IAlert } from '../components/alert/i-alert';
import { Subscriber } from 'rxjs';
import { SafeHtml } from '@angular/platform-browser';

/**
 * The ToolsService is used to display generic alerts or application error alerts.
 * It can also be used to handle subscriber errors to return a default value
 */
@Injectable({
    providedIn: 'root'
})
export class ToolsService {

    /**
     * The defaul application error title and message
     */
    private _appErrorTitle = 'Application error';
    private _appErrorMsg   = 'The application server is currently unavailable.';
    private _appDownMsg    = 'The application is currently down.';
    private _appVersionMsg = 'The appliation version is incorrect. The page will refresh when you click OK.';

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

    get appDownMsg() {
        return this._appDownMsg;
    }

    get appVersionMsg() {
        return this._appVersionMsg;
    }

    /**
     * Generic error message (single button message)
     * @param title - The title to display
     * @param msg - The message to display
     * @param error - Optional error object (with message property) to display
     */
    genericError(
        title: string, 
        msg: string | SafeHtml, 
        error?: HttpErrorResponse, 
        icon?: string, 
        iconColor?: string
    ): MatDialogRef<AlertComponent> {
        const content = msg + (error ? `<p>${error.message}</p>` : '');
        return this._dialog.open(AlertComponent, {
            data: {
                title,
                message: content,
                icon: icon || '',
                iconColor: iconColor || 'warn'
            } as IAlert,
            disableClose: true
        } as MatDialogConfig);
    }

    /**
     * Displays a generic two-button confirm pop-up
     * @param title - The title to display
     * @param msg - The message to display
     * @param btn1Text - The text for button 1 (default is OK)
     * @param btn2Text - The text for button 2 (default is Cancel)
     */
    genericConfirm(
        title: string, 
        msg: string | SafeHtml, 
        btn1Text: string = 'OK', 
        btn2Text: string = 'Cancel', 
        icon?: string, 
        iconColor?: string
    ): MatDialogRef<AlertComponent> {
        return this._dialog.open(AlertComponent, {
            data: {
                title,
                message: msg,
                buttonText1: btn1Text,
                buttonText2: btn2Text,
                showButton2: true,
                icon: icon || '',
                iconColor: iconColor || 'warn'
            } as IAlert,
            disableClose: true
        } as MatDialogConfig);
    }

    /**
     * Displays a three-button choice confirm box
     * @param title - The title to display
     * @param msg - The message to display
     * @param btn1Text - The text for button 1 (default is OK)
     * @param btn2Text - The text for button 2 (default is Cancel)
     * @param btn3Text - The text for button 3 (default is Maybe)
     */
    genericChoice(
        title: string, 
        msg: string | SafeHtml, 
        btn1Text: string = 'OK', 
        btn2Text: string = 'Cancel', 
        btn3Text: string = 'Maybe', 
        icon?: string, 
        iconColor?: string
    ): MatDialogRef<AlertComponent> {
        return this._dialog.open(AlertComponent, {
            data: {
                title,
                message: msg,
                buttonText1: btn1Text,
                buttonText2: btn2Text,
                buttonText3: btn3Text,
                showButton2: true,
                showButton3: true,
                icon: icon || '',
                iconColor: iconColor || 'warn'
            } as IAlert,
            disableClose: true
        } as MatDialogConfig);
    }

    /**
     * Displays an error using a MatDialog
     */
    onAppError(error: HttpErrorResponse): MatDialogRef<AlertComponent> {
        return this.genericError(this._appErrorTitle, this._appErrorMsg, error, 'error');
    }

    /**
     * Displays an error and completes a subscriber
     * @param error The HTTP error
     * @param subscriber The subscriber (if any) to send the value to and complete
     * @param val The value to send in the subscriber
     */
    onSubscriberError(error: HttpErrorResponse, subscriber?: Subscriber<any>, val?: any): MatDialogRef<AlertComponent> {
        if (subscriber) {
            subscriber.next(val);
            subscriber.complete();
        }
        return this.onAppError(error);
    }
}
