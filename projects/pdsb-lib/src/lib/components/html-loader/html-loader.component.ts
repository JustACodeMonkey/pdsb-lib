import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { HtmlLoaderService } from './html-loader.service';

@Component({
    selector: 'pdsb-html-loader',
    templateUrl: './html-loader.component.html',
    styleUrls: ['./html-loader.component.scss']
})
export class HtmlLoaderComponent implements OnInit, OnChanges {

    @Input() source: string;
    @Input() trusted = true;

    safeHtml: SafeHtml = '';

    constructor(
        private _loader: HtmlLoaderService,
        private _ds: DomSanitizer
    ) { }

    ngOnInit(): void {
    }

    ngOnChanges() {
        if (!this.source) {
            return;
        }
        this.load();
    }

    private load() {
        this._loader
            .load(this.source, this.trusted)
            .subscribe({
                next: (html: string) => {
                    this.safeHtml = this._ds.bypassSecurityTrustHtml(html);
                }
            });
    }
}
