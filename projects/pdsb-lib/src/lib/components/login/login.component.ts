import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../classes/user';
import { ToolsService } from '../../services/tools.service';
import { AppService } from '../../services/app.service';
import { AuthService } from '../../services/auth.service';
import { IBasicUserInfo } from '../../interfaces/i-basic-user-info';
import { InternalUse } from '../../classes/internal-use';

/**
 * Add <pdsb-login> to your main login component/page to handle app login
 * - The default URL is /apiRoot/login
 * - If the URL needs to be different use the urlPart input to add text between /apiRoot/ and login
 * 
 * Subscribe to userSelected on the LoginService
 * - You will receive only the selected user
 * - The LoginService sets the user in AuthService
 */
@Component({
    selector: 'pdsb-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    /**
     * By default, the call to the login API will use the rootApi from AppService appended with 'login'.
     * If there should be a URL part between those words, set it here. For example, if the final URL is
     * /rootApi/user/login, you would pass 'user' here.
     */
    @Input() urlPart = '';

    isLoggingIn = false;

    user = {
        username: '',
        password: ''
    }

    users: User[] = [];

    constructor(
        private _as: AppService,
        private _auth: AuthService,
        private _ts: ToolsService
    ) { }

    ngOnInit(): void {
    }

    onLogin(): void {
        this.isLoggingIn = true;
        this._auth
            .login(this.user.username, this.user.password, this.urlPart)
            .subscribe({
                next: (users: IBasicUserInfo[]) => {
                    // If no users are returned, the login attempt failed
                    // If 1 user is returned, set the user and continue
                    // If > 1 user is returned, display a selection for the user to pick which user
                    if (!users || users.length === 0) {
                        this.invalidUsernameOrPassword();
                    } else {
                        const status = users[0].status;
                        if (status === User.STATUS_APP_DOWN) {
                            // Show app down message
                            this._ts.genericError(this._ts.appErrorTitle, this._ts.appDownMsg);
                        } else if (status === User.STATUS_VERSION_ERROR) {
                            // Show version error message, then reload
                            this._ts
                                .genericError(this._ts.appErrorTitle, this._ts.appVersionMsg)
                                .afterClosed()
                                .subscribe({
                                    next: () => {
                                        this._as.forceRefresh();
                                    }
                                });
                        } else if (status === User.STATUS_BAD_USERNAME || status === User.STATUS_BAD_PASSWORD) {
                            // Display invalid username/password message
                            this.invalidUsernameOrPassword();
                        } else {
                            // If only a single account, select it, otherwise show account list
                            if (users.length === 1) {
                                this._auth.selectUser(new InternalUse(), users[0]);
                            } else if (users.length > 1) {
                                this.users = users;
                            }
                        }
                    }
                    this.isLoggingIn = false;
                }
            });
    }

    /**
     * Sets the selected user
     * @param user The selected user
     */
    setUser(user: User): void {
        this._auth.selectUser(new InternalUse(), user);
    }

    /**
     * Show a pop-up when the username or password are incorrect
     */
    private invalidUsernameOrPassword(): void {
        this._ts.genericError('Login Error', 'The username or password are incorrect');
    }
}
