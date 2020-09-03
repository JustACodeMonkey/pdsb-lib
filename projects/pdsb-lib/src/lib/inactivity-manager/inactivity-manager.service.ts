import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { MatDialog } from '@angular/material/dialog';
import { InactivityManagerComponent } from './inactivity-manager.component';

/**
 * Use the InactivityManagerService to ensure the user has not left their session inactive for too long
 * - When the session time has passed, an alert is shown
 * - After the alert time passes, the user is logged out
 */
@Injectable({
    providedIn: 'root'
})
export class InactivityManagerService {

    /**
     * Set the default inactivity times
     * 1. Until the warning is shown
     * 2. How long to show the warning
     */
    private _secondsUntilWarning = 1080; // 18 minutes
    private _secondsToWarn       = 120;  // 2 minutes

    /**
     * The event that can be subscribed to when the full inactivity time expires,
     * or when the user selects the logout button from the pop-up
     */
    private _inactiveTimeExceeded: Subject<boolean> = new Subject<boolean>();
    
    constructor(
        private _idle: Idle,
        private _dialog: MatDialog
    ) {
        this.init();
    }

    /**
     * Returns the inactivity subject, allowing other services/components/etc.
     * to subscribe to the event
     */
    get inactiveTimeExceeded() {
        return this._inactiveTimeExceeded;
    }

    /**
     * Sets the time until the warning popup appears
     * @param s The number of seconds until the popup appears
     */
    set secondsUntilWarning(s: number) {
        this._secondsUntilWarning = s;
        this._idle.setIdle(s);
    }

    /**
     * Sets the time to display the popup until automatic logout occurs
     * @param s The number of seconds to display the popup
     */
    set secondsToWarn(s: number) {
        this._secondsToWarn = s;
        this._idle.setTimeout(s);
    }

    /**
     * Starts the inactivity watcher
     */
    start() {
        if (this._idle.isRunning()) {
            this._idle.stop();
        }
        this._idle.watch();
    }

    /**
     * Stops the inactivity watcher
     */
    stop() {
        this._idle.stop();
    }

    /**
     * Initializes the inactivity settings
     */
    private init() {
        this._idle.setIdleName('inactiveIdle');
        this._idle.setIdle(this._secondsUntilWarning);
        this._idle.setTimeout(this._secondsToWarn);
        this._idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        // Start the timer that is used to show the dialog when it completes
        this._idle.onIdleStart.subscribe(() => {
            this._dialog
                .open(InactivityManagerComponent, {
                    data: {
                        idle: this._idle
                    }
                })
                .afterClosed()
                .subscribe(result => {
                    if (result === InactivityManagerComponent.LOGOUT) {
                        this._inactiveTimeExceeded.next(true);
                    }   // otherwise continue the session, clicking the button will restart the idle timer,
                        // so we don't have to do anything
                });
        });

        // And the timer for when the subsequent time expires to force a logout
        this._idle.onTimeout.subscribe(() => {
            this._dialog.closeAll(); // close the popup
            this._inactiveTimeExceeded.next(true);
        });
    }
}
