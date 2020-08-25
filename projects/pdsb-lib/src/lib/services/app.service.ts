import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** @dynamic */
@Injectable({
    providedIn: 'root'
})
/**
 * Use the AppService to get
 * 1. the API root
 * 2. the application version number
 * 3. the server-type we're running on (prod / dev / localhost)
 */
export class AppService {

    private _apiRoot = '';
    private _version = '';

    constructor(
        @Inject(DOCUMENT) private _doc: Document
    ) { }

    init(apiRoot: string, version: string) {
        this._apiRoot = apiRoot;
        this._version = version;
    }

    get apiRoot() {
        return this._apiRoot;
    }
    get version() {
        return this._version;
    }

    get isProd() {
        const href = this.href();
        return href.indexOf('gweb11') > -1
            || href.indexOf('ssp-');
    }

    get isNotProd() {
        return !this.isProd;
    }

    get isDev() {
        const href = this.href();
        return href.indexOf('devweb2') > -1
            || href.indexOf('dev-sspweb');
    }

    get isLocalHost() {
        const href = this.href();
        return href.indexOf('localhost') > -1
            || href.indexOf(':4200');
    }

    private href() {
        return this._doc.location.href;
    }
}
