import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IAlert } from './i-alert';
import { SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'pdsb-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

    static readonly RESPONSE_BUTTON_1 = 'btn1';
    static readonly RESPONSE_BUTTON_2 = 'btn2';
    static readonly RESPONSE_BUTTON_3 = 'btn3';

    // Used internall and in the HTML
    btn1 = AlertComponent.RESPONSE_BUTTON_1;
    btn2 = AlertComponent.RESPONSE_BUTTON_2;
    btn3 = AlertComponent.RESPONSE_BUTTON_3;

    // Included in IAlert
    title       = 'Alert';
    message: string | SafeHtml = '';            // This is required
    buttonText1 = 'OK';
    buttonText2 = 'Cancel';
    buttonText3 = 'Cancel';
    showButton2 = false;
    showButton3 = false;

    constructor(
        private _dialogRef: MatDialogRef<AlertComponent>,
        // The data is injected from the Material Dialog open
        // process. The data structure must match the IAlert interface
        @Inject(MAT_DIALOG_DATA) private _data: IAlert
    ) {
        this._dialogRef.disableClose = true;
    }

    ngOnInit() {
        // This will make our dialogs modal
        this._dialogRef.disableClose = true;

        const options    = this._data;
        this.title       = options.title || this.title;
        this.message     = options.message || '';
        // Set the button text
        this.buttonText1 = options.buttonText1 || this.buttonText1;
        this.buttonText2 = options.buttonText2 || this.buttonText2;
        this.buttonText3 = options.buttonText3 || this.buttonText3;
        // Set the button visibility
        this.showButton2 = options.showButton2 || false;
        this.showButton3 = options.showButton3 || false;
    }
}
