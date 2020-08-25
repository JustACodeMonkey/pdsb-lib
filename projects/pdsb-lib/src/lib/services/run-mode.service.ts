import { Injectable } from '@angular/core';
import { WindowManagerService } from '../window-manager/window-manager.service';

@Injectable({
    providedIn: 'root'
})
export class RunModeService {

    /**
     * Use this service to determine if the application is running as its own application,
     * or if it is running as the child of another application
     * @param _wm The Window Manager Service
     */
    constructor(
        private _wm: WindowManagerService
    ) { }

    /**
     * Returns true when the application is running in a child window
     */
    get isChild() {
        return this._wm.parentWindow !== null;
    }

    /**
     * Returns true when the application is running in its own (non-child) window
     */
    get isStandalone() {
        return this._wm.parentWindow === null;
    }
}
