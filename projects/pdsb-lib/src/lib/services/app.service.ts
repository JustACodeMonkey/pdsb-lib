import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PdsbLibConfiguration } from '../lib-configuration';

/** @dynamic
 * Use the AppService to get
 * 1. the API root
 * 2. the application version number
 * 3. the server-type we're running on (prod / dev / localhost)
 */
@Injectable({
    providedIn: 'root'
})
export class AppService {

    private _apiRoot = '';
    private _version = '';

    constructor(
        private readonly _config: PdsbLibConfiguration,
        @Inject(DOCUMENT) private _doc: Document
    ) {
        this._apiRoot = this._config.apiRoot;
        this._version = this._config.version;
    }

    get apiRoot() {
        return this._apiRoot;
    }
    get version() {
        return this._version;
    }

    get isProd() {
        const href = this.href();
        return href.indexOf('://gweb11') > -1
            || href.indexOf('://ssp-') > -1;
    }

    get isNotProd() {
        return !this.isProd;
    }

    get isDev() {
        const href = this.href();
        return href.indexOf('://devweb2') > -1
            || href.indexOf('://dev-sspweb') > -1;
    }

    get isLocalHost() {
        const href = this.href();
        return href.indexOf('://localhost') > -1
            || href.indexOf(':4200') > -1;
    }

    /**
     * Forces the window to refresh
     */
    forceRefresh() {
        this._doc.location.reload(true);
    }

    private href() {
        return this._doc.location.href;
    }
}
