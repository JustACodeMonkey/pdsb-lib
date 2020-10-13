import { Injectable, RendererFactory2, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { MessageData } from './message-data';
import { DOCUMENT } from '@angular/common';
import { PdsbLibConfiguration } from '../lib-configuration';

/** @dynamic =
 * Use the WindowManagerSerivce to pass messages between windows and to open child windows
 * - When child windows are opened this way, logging out of the application will automatically
 *   close those children
 */
@Injectable({
    providedIn: 'root'
})
export class WindowManagerService {

    private _assumeParentApp = false;
    private _referrer        = '';

    /**
     * Reference to the current window
     */
    private _win: Window;

    /**
     * An object to store references to the child windows
     */
    private _children = {};

    /**
     * Subject to dispatch received messages to the application
     */
    private _messageReceived: Subject<MessageEvent> = new Subject<MessageEvent>();

    constructor(
        private readonly _config: PdsbLibConfiguration,
        private _rf: RendererFactory2,
        @Inject(DOCUMENT) private _doc: Document
    ) {
        this._assumeParentApp = this._config.assumeParentApp;
        this._win             = (this._doc as Document).defaultView;
        this.initListener();
    }

    /**
     * Returns a reference to the parent window || null
     */
    get parentWindow(): Window {
        return this.isChildOfSameDomain()
            ? this._win.opener
            : null;
    }

    /**
     * Returns a reference to this window || null
     */
    get thisWindow(): Window {
        return this._win || null;
    }

    /**
     * Opens a window
     * @param url The URL to open
     * @param name The name of the window
     */
    open(url: string, name: string): void {
        const win = this.getWindow(name);
        if (win && !win.closed) {
            win.location.href = url;
            win.focus();
        } else {
            this._children[name] = this._win.open(url, name.toLowerCase());
        }
    }

    /**
     * Closes a window
     * @param name The name of the window to close
     *             Pass null to close this window
     */
    close(name: string): void {
        if (!name) {
            this.thisWindow.close();
        } else {
            const win = this.getWindow(name);
            if (win && !win.closed) {
                win.close();
            }
            delete this._children[name];
        }
    }

    /**
     * Closes all open windows
     */
    closeAll(): void {
        for (const prop in this._children) {
            this.close(prop);
        }
    }

    /**
     * Posts a message to a child window
     * @name name The name of the child window to send to
     * @param message The message to send
     * @param targetOrigin The targetOrigin (optional - leave blank)
     */
    postToChild(name: string, message: any, targetOrigin: string = '*'): void {
        this.post(this.getWindow(name), message, targetOrigin);
    }

    /**
     * Posts a message to the parent window
     * @param message The message to send
     * @param targetOrigin The targetOrigin (optional - leave blank)
     */
    postToParent(message: any, targetOrigin: string = '*'): void {
        this.post(this.parentWindow, message, targetOrigin);
    }

    /**
     * Posts a message to a child or parent window
     * @param win The window reference to post to
     * @param message The message to send
     * @param targetOrigin The targetOrigin
     */
    private post(win: Window, message: any, targetOrigin: string): void {
        if (win) {
            win.postMessage(message, targetOrigin);
        }
    }

    /**
     * Returns the reference to the window (or null)
     * @param name The name of the window to find
     */
    private getWindow(name: string): Window {
        let win = this._children[name];
        if (!win) {
            win = this._win.open('', name);
            if (win) {
                this._children[name] = win;
            }
        }
        return win;
    }

    /**
     * Listens for messages from other windows
     */
    private initListener(): void {
        this._rf
            .createRenderer(null, null)
            .listen('window', 'message', (e: MessageEvent) => {
                const data = e.data as MessageData;
                // If the action is close, we will close the child window
                if (data.action === MessageData.ACTION_CLOSE) {
                    this.close(data.appId);
                }
                // All messages are dispatched through the Subject
                this._messageReceived.next(e);
            });
    }

    /**
     * Returns true when the window is a child of the same domain referrer
     */
    private isChildOfSameDomain(): boolean {
        return this._win.opener
            && !this._assumeParentApp
            && this._doc.referrer.indexOf(this._doc.location.host) > -1;
    }
}
