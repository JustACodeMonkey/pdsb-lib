import { Injectable } from '@angular/core';
import { RunModeService } from './run-mode.service';
import { HttpHeaders } from '@angular/common/http';
import { StorageManagerService } from '../storage-manager/storage-manager.service';
import { User } from '../classes/user';

/**
 * The AuthService is used to
 * 1. Set Authorization headers for HTTP requests
 * 2. Update the token information stored in the session storage
 * 3. Determine if the user has a token
 * 4. Determine if the user has a is logged in with a valid token (has not expired)
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

    constructor(
        private _rm: RunModeService,
        private _storage: StorageManagerService
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
     * Updates the user stored in session storage
     * @param u The updated User object to store
     */
    updateUser(u?: User) {
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

    private getUser() {
        return this._storage.get(this.USER_STORE) as User || new User();
    }

    private getTokenTime() {
        return this._storage.get(this.USER_UPDATED_AT) as number || 0;
    }
}
