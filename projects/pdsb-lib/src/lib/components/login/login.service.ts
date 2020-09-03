import { Injectable } from '@angular/core';
import { AppService } from '../../services/app.service';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { User } from '../../classes/user';
import { ToolsService } from '../../services/tools.service';
import { AuthService } from '../../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    private _userSelected: Subject<User> = new Subject<User>();

    constructor(
        private _as: AppService,
        private _auth: AuthService,
        private _ts: ToolsService,
        private _http: HttpClient
    ) { }

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
     * @param urlPart Any URL parts between apiRoot and login
     */
    login(username: string, password: string, urlPart: string): Observable<User[]> {
        const url        = this._as.apiRoot + this.formatUrlPart(urlPart) + 'login';
        const appVersion = this._as.version;
        return new Observable<User[]>(subscriber => {
            this._http
                .post<User[]>(
                    url,
                    {
                        username,
                        password,
                        appVersion
                    },
                    this._auth.headers
                )
                .subscribe({
                    next: (users: User[]) => {
                        subscriber.next(users);
                        subscriber.complete();
                    },
                    error: error => this._ts.onSubscriberError(error, subscriber, new User())
                });
        });
    }

    /**
     * Called when the user selects a user
     * @param user The User that is selected
     */
    selectUser(user: User) {
        this._auth.updateUser(user);
        this._userSelected.next(user);
    }

    /**
     * Formats the URL so that it can be added between apiRoot and login
     * @param urlPart The URL part between apiRoot and login (if any)
     */
    private formatUrlPart(urlPart: string) {
        if (urlPart === null || urlPart === '') {
            return '';
        }
        return urlPart.charAt(urlPart.length - 1) === '/'
            ? urlPart
            : urlPart + '/';
    }
}
