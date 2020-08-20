import { ManagerBase } from './manager-base';
import { IManager } from './i-manager';
import { Item } from './item';
import { DocRef } from './doc-ref';

/**
 * The CookieManager handles getting / setting / removing cookies
 * - It will prepend /common/ OR /APP_NAME/ to the start of each key name
 * - It will append /expires OR /saves to the end of each key name to keep track of expiring cookies
 */
export class CookieManager extends ManagerBase implements IManager {

    constructor() {
        super();
    }

    /**
     * Static method to read a cookie (can be used outside of the main storage manager service)
     * @param name string
     */
    static read(name: string) {
        const cookies = DocRef.doc.cookie.split(';');
        let json;
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                json = decodeURIComponent(cookie.substring(name.length + 1, cookie.length));
                break;
            }
        }
        return json;
    }

    /**
     * Static method to write a cookie (can be used outside of the main storage manager service)
     * @param name string
     * @param val string
     * @param expires boolean
     * @param path string
     */
    static write(name: string, val: string, expires: boolean, path?: string) {
        const strVal     = encodeURIComponent(val);
        const strExpires = (expires ? '' : ';expires=Fri, 31 Dec 9999 23:59:59 GMT');
        const strPath    = ';path=' + (path || '/');
        DocRef.doc.cookie  = `${name}=${strVal}${strExpires}${strPath}`;
        if (DocRef.doc.cookie.length > 4096) {
            alert ('Cookie size limit reached');
        }
        return true;
    }

    /**
     * Returns the Item with the associated key
     * @param key string
     */
    find(key: string) {
        let item: Item;

        if (this.get(new Item(key, true, true))) {
            item = new Item(key, true, true);
        } else if (this.get(new Item(key, true, false))) {
            item = new Item(key, true, false);
        } else if (this.get(new Item(key, false, true))) {
            item = new Item(key, false, true);
        } else if (this.get(new Item(key, false, false))) {
            item = new Item(key, false, false);
        }
        return item;
    }

    /**
     * Gets a cookie's value
     * @param key string - The name of the cookie
     * @param expires boolean - Whether or not the cookie expires
     */
    get(item: Item) {
        const path = this._path(item);
        const json = CookieManager.read(path);
        return json ? JSON.parse(json) : null;
    }

    /**
     * Sets a cookie value
     * @param key string - The name of the cookie to set
     * @param val string - The stringified JSON value of the cookie
     * @param expires boolean - Whether or not the cookie expires
     */
    set(item: Item, val: string | number | boolean | object | Array<any>) {
        const path = this._path(item);
        const json = JSON.stringify(val);
        return CookieManager.write(path, json, item.expires);
    }

    /**
     * Removes a cookie
     * @param key string - The name of the cookie to remove
     * @param expires boolean - Whether or not the cookie expires
     */
    remove(item: Item) {
        const path = this._path(item);
        DocRef.doc.cookie = path + '=';
        return true;
    }

    /**
     * Converts the cookie's name into a path by appending nothing (for cookies that expire) or /! (for cookies that don't)
     * @param key string - The name of the cookie
     * @param expires boolean - Whether or not the cookie expires
     */
    protected _path(item: Item) {
        return super._path(item) + (item.expires ? '' : '/!');
    }
}