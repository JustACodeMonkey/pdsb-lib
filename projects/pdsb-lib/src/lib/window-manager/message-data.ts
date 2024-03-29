/**
 * The MessageData class describs the data structures that is used to post
 * messages between windows when using the WindowManagerService
 */
export class MessageData {
    /**
     * When the close action is passed, the parent window will attempt to automatically
     * close the child window. All other actions will only be passed onto the parent 
     * application through the Subject
     */
    static readonly ACTION_CLOSE = 'close';

    /**
     * The type of message being sent
     */
    static readonly TYPE_WINDOW  = 'window';
    static readonly TYPE_IFRAME  = 'iFrame';

    /**
     * Derived from window.name in the child window. This name will match the name
     * from when the window was created
     */
    appId: string;

    /**
     * The full name of the application running in the child window
     */
    appName: string;

    /**
     * The action the receiving window should perform
     */
    action: string;

    /**
     * The message body that is sent
     */
    message: any;

    /**
     * The type of message (window or iFrame)
     */
    messageType: string;

    constructor(appId: string, appName: string, action: string, message: any, messageType: string) {
        this.appId       = appId;
        this.appName     = appName;
        this.action      = action;
        this.message     = message;
        this.messageType = messageType;
    }
}
