import { Injectable, SecurityContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class HtmlLoaderService {

    constructor(
        private _http: HttpClient,
        private _ds: DomSanitizer
    ) { }

    load(file: string, trusted: boolean = true): Observable<string> {
        return this._http
            .get(file, {
                responseType: 'text'
            })
            .pipe(
                map(response => this.mapHtml(response, trusted))
            );
    }

    private mapHtml (html: string, trusted: boolean): string {
        return trusted
            ? html
            : this._ds.sanitize(SecurityContext.HTML, html);
    }
}
