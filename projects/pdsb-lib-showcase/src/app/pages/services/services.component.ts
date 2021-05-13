import { Component, ElementRef } from '@angular/core';

class Source {
    title = '';
    url   = '';

    constructor(title: string, url: string) {
        this.title = title;
        this.url   = './assets/service-descriptions/' + url + '.html';
    }
}
@Component({
    selector: 'app-services',
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.scss']
})
export class ServicesComponent {

    sources: Source[] = [
        new Source('AppService', 'app'),
        new Source('AuthService', 'auth'),
        new Source('IFrameManagerService', 'i-frame-manager'),
        new Source('InactivityMonitorService', 'inactivity-manager'),
        new Source('PrintManagerService', 'print-manager'),
        new Source('RunModeService', 'run-mode'),
        new Source('StorageManagerService', 'storage-manager'),
        new Source('TokenManagerService', 'token-manager'),
        new Source('ToolsService', 'tools'),
        new Source('WindowManagerService', 'window-manager')
    ];

    constructor(
        private _el: ElementRef<HTMLElement>
    ) {}

    scrollTo(source: Source) {
        const name = source.url.substring(source.url.lastIndexOf('/') + 1, source.url.length - 5);
        const el   = this._el.nativeElement.querySelector('[name="' + name + '"]');
        if (el) {
            el.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    scrollTop() {
        this._el.nativeElement.querySelector('[name="top"]').scrollIntoView({
            behavior: 'smooth'
        });
    }
}
