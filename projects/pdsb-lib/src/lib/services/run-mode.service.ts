import { Injectable } from '@angular/core';
import { IFrameManagerService } from '../window-manager/i-frame-manager.service';
import { WindowManagerService } from '../window-manager/window-manager.service';

/**
 * Use this service to determine if the application is running as its own application,
 * or if it is running as the child of another application
 */
@Injectable({
    providedIn: 'root'
})
export class RunModeService {

    constructor(
        private _im: IFrameManagerService,
        private _wm: WindowManagerService
    ) { }

    /**
     * Returns true when the application is running in a child window
     */
    get isChild(): boolean {
        return this._im.isChild
            || this._wm.parentWindow !== null;
    }

    /**
     * Returns true when the application is running in its own (non-child) window
     */
    get isStandalone(): boolean {
        return !this._im.isChild
            || this._wm.parentWindow === null;
    }
}
