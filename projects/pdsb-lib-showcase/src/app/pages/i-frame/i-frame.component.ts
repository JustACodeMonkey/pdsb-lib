import { Component, OnInit } from '@angular/core';
import { IFrameManagerService } from 'projects/pdsb-lib/src/lib/window-manager/i-frame-manager.service';

@Component({
    selector: 'app-i-frame',
    templateUrl: './i-frame.component.html',
    styleUrls: ['./i-frame.component.scss']
})
export class IFrameComponent implements OnInit {

    constructor(
        private _is: IFrameManagerService
    ) {
        this._is.open('http://localhost:4200/', 'local', {
            height: '200px',
            top:    '200px'
        });
    }

    ngOnInit(): void {
    }
}
