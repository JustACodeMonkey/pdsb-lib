import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { RunModeService } from './run-mode.service';
import { AppService } from './app.service';
import { StorageManagerService } from '../storage-manager/storage-manager.service';
import { User } from '../classes/user';
import { ToolsService } from './tools.service';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { IBasicUserInfo } from '../interfaces/i-basic-user-info';
import { InternalUse } from '../classes/internal-use';
import { PdsbLibConfiguration } from '../lib-configuration';

class Header {
    name  = '';
    value = '';

    constructor(name: string, value: string) {
        this.name  = name;
        this.value = value;
    }
}
/**
 * The AuthService is used to
 * 1. Set Authorization headers for HTTP requests
 * 2. Update the token information stored in the session storage
 * 3. Determine if the user has a token
 * 4. Determine if the user has a is logged in with a valid token (has not expired)
 * 5. Login
 * 6. Logout
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {

    /**
     * The location of the session storage for the user information
     */
    readonly USER_STORE      = 'user';
    readonly USER_UPDATED_AT = 'token-update-time';
    
    readonly TOKEN_MAX_TIME  = 1000 * 60 * 45; // Max 45 minutes

    private _isSISapp = true;
    private _headers: Header[] = [];
    private _userSelected: ReplaySubject<IBasicUserInfo> = new ReplaySubject<IBasicUserInfo>(1);
    private _loggedOut: Subject<null>                    = new Subject<null>();

    constructor(
        private readonly _config: PdsbLibConfiguration,
        private _as: AppService,
        private _rm: RunModeService,
        private _storage: StorageManagerService,
        private _ts: ToolsService,
        private _http: HttpClient
    ) {
        this._isSISapp = this._config.isSISapp;

        // Look for a user in the storage ... if one exists, we can emit the _userSelected ReplaySubject
        // This will likely happen before other services/components subscribe (thus ReplaySubject)
        const user = this.getUser();
        if (user.status === User.STATUS_LOGGED_IN) {
            this._userSelected.next(user);
        }
    }

    /**
     * Returns the headers for authorization used for HTTP requests
     */
    get headers() {
        // Default headers
        const user  = this.getUser();
        let headers = new HttpHeaders()
            .set('Authorization', 'Bearer ' + (user ? user.token : ''))
            .set('Cache-Control', 'no-cache')
            .set('Pragma', 'no-cache')
            .set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
        // Additional application specific headers
        for (const header of this._headers) {
            headers = headers.append(header.name, header.value);
        }
        return {headers};
    }

    /**
     * Returns true if the user has a token that has not expired
     */
    get hasToken() {
        const user = this.getUser();
        return (user && user.token && user.token !== '')
            ? true
            : false;
    }

    /**
     * Returns true when the user is logged in
     */
    get isLoggedIn(): boolean {
        const user = this.getUser();
        return (this.hasToken && user.status === User.STATUS_LOGGED_IN)
            ? true
            : false;
    }

    /**
     * Returns true if the token's last refresh time is within the refresh window
     */
    get tokenTimeValid() {
        const now       = (new Date()).getTime();
        const tokenTime = this.getTokenTime();
        return Math.abs(now - tokenTime) < this.TOKEN_MAX_TIME;
    }

    /**
     * Returns true if the user is logged in and the token time is valid
     */
    get isLoggedInAndValidTime() {
        return (this.isLoggedIn && this.tokenTimeValid)
            ? true
            : false;
    }

    /**
     * Returns the subject that emits when a user is selected
     */
    get userSelected() {
        return this._userSelected;
    }

    /**
     * Returns the subject that emits when a user logs out
     */
    get loggedOut() {
        return this._loggedOut;
    }

    /**
     * Returns the User's displayName
     */
    get displayName() {
        return this.getUser().displayName;
    }

    /**
     * Returns the User's status
     */
    get status() {
        return this.getUser().status;
    }

    /**
     * When true, user changes save to the /sis/ storage area
     */
    set isSISapp(isSISapp: boolean) {
        this._isSISapp = isSISapp;
    }

    /**
     * Returns any generic prop that is saved in the User object
     * @param prop The name of the prop to get
     */
    getUserProp(prop: string): any {
        return this.getUser()[prop];
    }

    /**
     * Updates the specified user property and saves to user storage
     * @param prop The name of the prop to set
     * @param val The value to set
     */
    setUserProp(prop: string, val: any) {
        const user = this.getUser();
        user[prop] = val;
        this._storage.set(this.USER_STORE, user, true, this._isSISapp);
    }

    /**
     * Adds an extra header to include
     * @param name The name of the header to add
     * @param value The value of the header
     */
    addAppHeader(name: string, value: string) {
        this.removeAppHeader(name);
        this._headers.push(new Header(name, value));
    }

    /**
     * Removes an extra header from the include list
     * @param name The name of the header to remove
     */
    removeAppHeader(name: string) {
        for (let i = 0; i < this._headers.length; i++) {
            if (this._headers[i].name === name) {
                this._headers.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Attempts to log into the application and return an array User objects
     * - Most users will have a single item in the array
     * - If the user has multiple items, they will need to select one of the users
     *   before they can proceed
     * @param username The SIS_USERNAME, email address, or p#
     * @param password The SIS password or AD password
     * @param urlPart (Optional) Any URL parts between apiRoot and login
     */
    login(username: string, password: string, urlPart: string = ''): Observable<IBasicUserInfo[]> {
        const url        = this._as.apiRoot + this.formatUrlPart(urlPart) + 'login';
        const appVersion = this._as.version;
        // If the user is trying to login with their @pdsb.net account, just take the P# portion
        const pdsbNet    = username.indexOf('@pdsb.net');
        if (pdsbNet > -1) {
            username = username.substring(0, pdsbNet);
        }
        return new Observable<IBasicUserInfo[]>(subscriber => {
            this._http
                .post<IBasicUserInfo[]>(
                    url,
                    {
                        username,
                        password,
                        appVersion
                    },
                    this.headers
                )
                .subscribe({
                    next: (users: IBasicUserInfo[]) => {
                        subscriber.next(users);
                        subscriber.complete();
                    },
                    error: error => this._ts.onSubscriberError(error, subscriber, [new User()])
                });
        });
    }

    /**
     * Sets the logout time in the USAGE_CONTROL table and returns an empty user
     * @param loginId The specific login ID returned after the user was selected
     * @param urlPart (Optional) Any URL parts between apiRoot and logout
     */
    logout(loginId: number, urlPart: string = ''): Observable<IBasicUserInfo> {
        return new Observable<IBasicUserInfo>(subscriber => {
            this._http
                .delete<IBasicUserInfo>(
                    this._as.apiRoot + this.formatUrlPart(urlPart) + 'logout/' + (loginId ? loginId : -1),
                    this.headers
                )
                .subscribe({
                    next: (user: IBasicUserInfo) => {
                        this._headers = [];
                        this._storage.removeAll(true);
                        subscriber.next(user);
                        subscriber.complete();
                        this._loggedOut.next();
                    },
                    error: error => {
                        this._headers = [];
                        this._storage.removeAll(true);
                        subscriber.next(new User());
                        subscriber.complete();
                        this._loggedOut.next();
                    }
                })
        });
    }

    /**
     * Called when the user selects a user
     * - THIS SHOULD ONLY BE CALLED FROM THE INTERNAL LOGIN COMPONENT
     * @param code The internal user only code
     * @param user The User that is selected
     */
    selectUser(code: InternalUse, user: IBasicUserInfo): void {
        if (code instanceof InternalUse) {
            this.updateFromTokenManager(code, user, true);
            this._userSelected.next(user);
        }
    }

    /**
     * Updates the user's status/token stored in session storage
     * - THIS SHOULD ONLY BE CALLED FROM THE INTERNAL TokenManagerService or this AuthService
     * @param code The internal user only code
     * @param u The updated User object to store
     * @param overwrite When true the entire user object is overwritten (as opposed to just the status and token)
     */
    updateFromTokenManager(code: InternalUse, u?: IBasicUserInfo, overwrite?: boolean): void {
        if (code instanceof InternalUse && this._rm.isStandalone) {
            if (u) {
                const user  = overwrite ? u : this.getUser();
                user.status = u.status;
                user.token  = u.status === User.STATUS_LOGGED_IN ? u.token : '';
                this._storage.set(this.USER_STORE, user, true, this._isSISapp);
                this._storage.set(this.USER_UPDATED_AT, (new Date()).getTime(), true, this._isSISapp);
            } else {
                this._storage.remove(this.USER_STORE);
                this._storage.remove(this.USER_UPDATED_AT);
            }
        }
    }

    private getUser(): IBasicUserInfo {
        return this._storage.get(this.USER_STORE) as IBasicUserInfo || new User();
    }

    private getTokenTime(): number {
        return this._storage.get(this.USER_UPDATED_AT) as number || 0;
    }

    /**
     * Formats the URL so that it can be added between apiRoot and login
     * @param urlPart The URL part between apiRoot and login (if any)
     */
    private formatUrlPart(urlPart: string): string {
        if (urlPart === null || urlPart === '') {
            return '';
        }
        return urlPart.charAt(urlPart.length - 1) === '/'
            ? urlPart
            : urlPart + '/';
    }
}
