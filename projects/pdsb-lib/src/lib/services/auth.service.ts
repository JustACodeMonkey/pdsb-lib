import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { RunModeService } from './run-mode.service';
import { AppService } from './app.service';
import { StorageManagerService } from '../storage-manager/storage-manager.service';
import { User } from '../classes/user';
import { ToolsService } from './tools.service';
import { Subject, Observable } from 'rxjs';
import { IBasicUserInfo } from '../interfaces/i-basic-user-info';

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
    readonly USER_UPDATED_AT = 'userUpdatedAt';
    
    readonly TOKEN_MAX_TIME  = 1000 * 60 * 45; // Max 45 minutes

    private _userSelected: Subject<IBasicUserInfo> = new Subject<IBasicUserInfo>();

    constructor(
        private _as: AppService,
        private _rm: RunModeService,
        private _storage: StorageManagerService,
        private _ts: ToolsService,
        private _http: HttpClient
    ) { }

    /**
     * Returns the headers for authorization used for HTTP requests
     */
    get headers() {
        const user = this.getUser();
        return {
            headers: new HttpHeaders()
                .set('Authorization', 'Bearer ' + (user ? user.token : ''))
                .set('Cache-Control', 'no-cache')
                .set('Pragma', 'no-cache')
                .set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT')
        };
    }

    /**
     * Returns true if the user has a token that has not expired
     */
    get hasToken() {
        const user = this.getUser();
        return user 
            && user.token
            && user.token !== '';
    }

    /**
     * Returns true when the user is logged in
     */
    get isLoggedIn() {
        const user = this.getUser();
        return this.hasToken
            && user.status === User.STATUS_LOGGED_IN;
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
        return this.isLoggedIn
            && this.tokenTimeValid;
    }

    /**
     * Returns the subject that emits when a user is selected
     */
    get userSelected() {
        return this._userSelected;
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
                    error: error => this._ts.onSubscriberError(error, subscriber, new User())
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
                    this._as.apiRoot + this.formatUrlPart(urlPart) + 'logout/' + loginId,
                    this.headers
                )
                .subscribe({
                    next: (user: IBasicUserInfo) => {
                        this._storage.removeAll();
                        subscriber.next(user);
                        subscriber.complete();
                    },
                    error: error => {
                        this._storage.removeAll();
                        subscriber.next(new User());
                        subscriber.complete();
                    }
                })
        });
    }

    /**
     * Called when the user selects a user
     * @param user The User that is selected
     */
    selectUser(user: IBasicUserInfo) {
        this.updateUser(user);
        this._userSelected.next(user);
    }

    /**
     * Updates the user stored in session storage
     * @param u The updated User object to store
     */
    updateUser(u?: IBasicUserInfo): void {
        if (this._rm.isStandalone) {
            if (u) {
                const user  = this.getUser();
                user.status = u.status;
                user.token  = user.status === User.STATUS_LOGGED_IN ? u.token : '';
                this._storage.set(this.USER_STORE, user, true, true);
                this._storage.set(this.USER_UPDATED_AT, (new Date()).getTime());
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
