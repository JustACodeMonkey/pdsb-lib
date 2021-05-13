import { Component } from '@angular/core';

class Page {
    title = '';
    url   = '';

    constructor(title: string, url: string) {
        this.title = title;
        this.url   = url;
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    pages = [
        new Page('Alerts', 'alerts'),
        new Page('Login', 'login'),
        new Page('HTML Loader', 'html-loader'),
        new Page('Services', 'services'),
        new Page('IFrameManager', 'iframe')
    ];
    title = 'pdsb-lib-showcase';
}
