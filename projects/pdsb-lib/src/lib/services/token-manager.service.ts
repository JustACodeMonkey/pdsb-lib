import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, Subject } from 'rxjs';
import { RunModeService } from './run-mode.service';
import { AuthService } from './auth.service';
import { ToolsService } from './tools.service';
import { User } from '../classes/user';
import { AppService } from './app.service';
import { DOCUMENT } from '@angular/common';

enum VisibilityChangeName {
    DEFAULT = 'visibilitychange',
    MOZ     = 'mozvisibilitychange',
    WEBKIT  = 'webkitvisibilitychange',
    MS      = 'msvisibilitychange'
}

enum VisibilityStateName {
    DEFAULT = 'hidden',
    MOZ     = 'mozHidden',
    WEBKIT  = 'webkitHidden',
    MS      = 'msHidden'
}

/** @dynamic 
 * Use the TokenManagerService to maintain a token
 * - Tokens expire every 60 minutes on the Java server
 * - This service refreshes tokens at 20 minute intervals to ensure it never expires
 *   (The 20 minute interval matches the inactivity timeout interval)
 * - Tokens are only maintained (updated) when the app is running in standalone mode
 *   (Child windows always use the token from the parent window)
 */
@Injectable({
    providedIn: 'root'
})
export class TokenManagerService {

    private _interval: Observable<number>;
    private _intervalTime = 1000 * 60 * 20;
    private _lastUpdate   = 0;

    private _tokenExpired: Subject<null>      = new Subject<null>();
    private _appVersionChanged: Subject<null> = new Subject<null>();
    private _appHasGoneDown: Subject<null>    = new Subject<null>();

    constructor(
        private _as: AppService,
        private _rm: RunModeService,
        private _auth: AuthService,
        private _ts: ToolsService,
        private _http: HttpClient,
        @Inject(DOCUMENT) private _doc: Document
    ) {
        if (this._rm.isStandalone) {
            this.watchWindowState();
            this.maintainToken();
        };
    }

    /**
     * Get the token expired (user is logged out) Subject
     */
    get tokenExpired() {
        return this._tokenExpired;
    }

    /**
     * Get the app version changed Subject
     */
    get appVersionChanged() {
        return this._appVersionChanged;
    }

    /**
     * Get the app is down Subject
     */
    get appHasGoneDown() {
        return this._appHasGoneDown;
    }

    /**
     * Watch the tab state to ensure the token is refreshed when the tab re-gains focus
     */
    private watchWindowState() {
        let eventName = '';
        let propName  = '';

        if (VisibilityStateName.DEFAULT in this._doc) {
            eventName = VisibilityChangeName.DEFAULT;
            propName  = VisibilityStateName.DEFAULT;
        } else if (VisibilityStateName.MOZ in this._doc) {
            eventName = VisibilityChangeName.MOZ;
            propName  = VisibilityStateName.MOZ;
        } else if (VisibilityStateName.WEBKIT in this._doc) {
            eventName = VisibilityChangeName.WEBKIT;
            propName  = VisibilityStateName.WEBKIT;
        } else {
            eventName = VisibilityChangeName.MS;
            propName  = VisibilityStateName.MS;
        }

        this._doc
            .addEventListener(eventName, (e) => {
                // Since we're checking the "hidden" property, we care about when it
                // is false ... meaning the tab / window was just re-focused
                if (!this._doc[propName]) {
                    // Tell whatever listens for the token that the app just woke up
                    this.refreshToken();
                }
            });
    }

    /**
     * Sets up an interval to ensure the token remains valid
     */
    private maintainToken() {
        this._interval = interval(this._intervalTime);
        this._interval
            .subscribe({
                next: (i) => {
                    this.refreshToken();
                }
            });
        this.refreshToken();
    }

    /**
     * Refreshes the token
     */
    private refreshToken() {
        const now      = (new Date()).getTime();
        const diff     = now - this._lastUpdate;
        const doUpdate = diff === now || diff > this._intervalTime;
        if (this._auth.hasToken && doUpdate) {
            this._lastUpdate = now;
            this._http
                .get<User>(
                    this._as.apiRoot + 'refresh-token?version=' + this._as.version,
                    this._auth.headers
                )
                .subscribe({
                    next: (user: User) => {
                        if (user.status === User.STATUS_LOGGED_IN) {
                            this._auth.updateUser(user);
                        } else {
                            this._ts.genericError('Could not refresh token', 'User status is ' + user.status);
                            if (user.status === User.STATUS_LOGGED_OUT) {
                                this._tokenExpired.next();
                            } else if (user.status === User.STATUS_VERSION_ERROR) {
                                this._appVersionChanged.next();
                            } else if (user.status === User.STATUS_APP_DOWN) {
                                this._appHasGoneDown.next();
                            }
                        }
                    },
                    error: error => this._ts.onAppError(error)
                });
        }
    }
}
