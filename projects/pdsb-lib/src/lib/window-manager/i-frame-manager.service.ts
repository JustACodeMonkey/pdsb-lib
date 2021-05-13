import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, RendererFactory2 } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Subject } from 'rxjs';
import { PdsbLibConfiguration } from '../lib-configuration';
import { MessageData } from './message-data';

class iFrameDetails {
    id        = '';
    urlToLoad = '';
    urlLoader = '';
    ref: HTMLIFrameElement | null = null;

    constructor(id: string, urlToLoad: string, urlLoader: string, ref: HTMLIFrameElement | null) {
        this.id        = id;
        this.urlToLoad = urlToLoad;
        this.urlLoader = urlLoader;
        this.ref       = ref;
    }
}

/** @dynamic =
 * Use the iFrameManagerSerivce to pass messages between applications and to open child iFrames
 * - When child iFrames are opened this way, logging out of the application will automatically
 *   close those children
 */
@Injectable({
    providedIn: 'root'
})
export class IFrameManagerService {

    private readonly ID = 'iframe_';

    /**
     * The animation speed to fade in / out the iFrame
     */
    private _animationMS = 500;

    /**
     * Reference to the current window
     */
    private _win: Window;

    /**
     * An object to store references to the child iFrames
     */
    private _children: {[key: string]: iFrameDetails} = {};

    /**
     * Subject to dispatch received messages to the application
     */
     private _messageReceived: Subject<MessageEvent> = new Subject<MessageEvent>();

    constructor(
        private readonly _config: PdsbLibConfiguration,
        private _rf: RendererFactory2,
        private _router: Router,
        @Inject(DOCUMENT) private _doc: Document
    ) {
        this._win = (this._doc as Document).defaultView;
        this.initListener();
        this.initRouteListener();
    }

    /**
     * Returns true when running as a child
     */
    get isChild(): boolean {
        return this.isChildOfSameDomain();
    }

    /**
     * Returns the top window
     */
    get parentWindow(): Window {
        return this._win.parent;
    }

    /**
     * Returns this frame or window
     */
    get thisFrame(): Window {
        return this._win.self;
    }

    /**
     * Used to override the default animation MS
     */
    set animationMS(ms: number) {
        this._animationMS = ms;
    }

    /**
     * Creates and loads an iFrame
     * @param url The URL to open
     * @param id The ID of the iFrame
     * @param styleOptions Object containing iFrame style overrides (default is full screen)
     */
    open(url: string, id: string, styleOptions?: {}): void {
        id = id.toLowerCase();
        this.close(id);
        
        const iFrame = this._doc.createElement('iframe');
        iFrame.id    = this.ID + id;
        iFrame.src   = url;
        // iFrame.style.backgroundColor = '#FFF';
        iFrame.style.zIndex          = '10000';
        iFrame.style.width           = '100vw';
        iFrame.style.height          = '100vh';
        iFrame.style.border          = 'none';
        iFrame.style.position        = 'fixed';
        iFrame.style.top             = '0';
        iFrame.style.left            = '0';
        iFrame.style.opacity         = '0'; // So we can animate the iFrame being added

        // Overwrite default styles with provided options
        for (const prop in styleOptions) {
            iFrame.style[prop] = styleOptions[prop];
        }

        this.thisFrame.document.body.appendChild(iFrame);
        this._children[id] = new iFrameDetails(id, url, this._router.url, iFrame);

        // Set the iFrame opacity to 1 to ensure it's visible and to kick off the animation
        setTimeout(() => {
            iFrame.style.opacity = '1';
        }, 10);
    }

    /**
     * Removes an iFrame from the DOM
     * @param id The ID of the iFrame
     */
    close(id: string, tellParent: boolean = false): void {
        id = id.toLowerCase();
        if (tellParent && this.isChildOfSameDomain()) {
            this.postToParent(new MessageData(
                id, 
                id, 
                MessageData.ACTION_CLOSE, 
                null, 
                MessageData.TYPE_IFRAME
            ));
        } else {
            // Ensure iFrame with same ID does not exist
            const exists = this._doc.querySelector('#' + this.ID + id) as HTMLIFrameElement;
            if (exists) {
                exists.style.opacity = '0';
                setTimeout(() => {
                    exists.remove();
                    delete this._children[id];
                }, this._animationMS);
            }
        } 
    }

    /**
     * Closes all open iFrames
     */
     closeAll(): void {
        for (const prop in this._children) {
            this.close(prop);
        }
    }

    /**
     * Posts a message to an iFrame
     * @name id The ID of the iFrame to send to
     * @param message The message to send
     * @param targetOrigin The targetOrigin (optional - leave blank)
     */
     postToChild(id: string, message: MessageData, targetOrigin: string = '*'): void {
        this.post(this.getIFrame(id), message, targetOrigin);
    }

    /**
     * Posts a message to the parent window
     * @param message The message to send
     * @param targetOrigin The targetOrigin (optional - leave blank)
     */
    postToParent(message: MessageData, targetOrigin: string = '*'): void {
        this.post(this.parentWindow, message, targetOrigin);
    }

    /**
     * Posts a message to a child or parent window
     * @param win The window reference to post to
     * @param message The message to send
     * @param targetOrigin The targetOrigin
     */
    private post(win: Window, message: MessageData, targetOrigin: string): void {
        if (win) {
            win.postMessage(message, targetOrigin);
        }
    }

    /**
     * Returns the reference to the iFrame (or null)
     * @param id The ID of the iFrame to find
     */
    private getIFrame(id: string): Window {
        id = id.toLowerCase();
        let iFrame = this._children[id].ref;
        if (!iFrame) {
            iFrame = this._doc.querySelector('#' + this.ID + id);
            if (iFrame) {
                this._children[id] = new iFrameDetails(id, iFrame.src, this._router.url, iFrame);
            }
        }
        return this._children[id].ref.contentWindow;
    }

    /**
     * Listens for messages from other windows
     */
     private initListener(): void {
        this._rf
            .createRenderer(null, null)
            .listen('window', 'message', (e: MessageEvent) => {
                const data = e.data as MessageData;
                if (data && data.messageType && data.messageType === MessageData.TYPE_IFRAME) {
                    // If the action is close, we will close the child window
                    if (data.action === MessageData.ACTION_CLOSE) {
                        this.close(data.appId);
                    }
                    // All messages are dispatched through the Subject
                    this._messageReceived.next(e);
                }
            });
    }

    /**
     * Listens for navigation end events
     * - If the Route 
     */
    private initRouteListener() {
        this._router.events.subscribe({
            next: (e: RouterEvent) => {
                if (e instanceof NavigationEnd) {
                    // Loop over the children
                    // If the nav URL is different than the URL when the iFrame was opened,
                    // close the iFrame
                    for (const prop in this._children) {
                        const details = this._children[prop];
                        if (e.url !== details.urlLoader) {
                            this.close(details.id);
                        }
                    }
                }
            }
        });
    }

    /**
     * Returns true when the window is a child of the same domain referrer
     */
     private isChildOfSameDomain(): boolean {
        return this._win.self !== this._win.top
            && this._win.self.location.host === this._win.top.location.host;
    }
}
