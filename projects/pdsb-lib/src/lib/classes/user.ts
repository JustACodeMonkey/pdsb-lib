import { IBasicUserInfo } from '../interfaces/i-basic-user-info';

export class User implements IBasicUserInfo {
    static STATUS_LOGGED_OUT        = 0;
    static STATUS_BAD_USERNAME      = 1;
    static STATUS_BAD_PASSWORD      = 2;
    static STATUS_TOO_MANY_SESSIONS = 3;
    static STATUS_LOGGED_IN         = 4;
    static STATUS_VERSION_ERROR     = 10;
    static STATUS_APP_DOWN          = 100;

    token       = '';
    status      = 0;
    displayName = '';

    constructor(status?: number, token?: string, displayName?: string) {
        this.status      = status || 0;
        this.token       = token  || '';
        this.displayName = displayName   || '';
    }
}
