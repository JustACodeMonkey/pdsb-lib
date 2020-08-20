import { ManagerBase } from './manager-base';
import { IManager } from './i-manager';
import { Item } from './item';
import { WinRef } from './win-ref';

/**
 * The StorageManager handles getting / setting / removing from local and session storage
 * - Expiring keys are set to session storage
 * - Non-expiring keys are set to local storage
 */
export class StorageManager extends ManagerBase implements IManager {

    readonly _ls = WinRef.win.localStorage;
    readonly _ss = WinRef.win.sessionStorage;

    constructor() {
        super();
    }

    /**
     * Returns the Item with the associated key
     * @param key string
     */
    find(key: string) {
        const commonPath = this._pathFromKey(key, true);
        const basePath = this._pathFromKey(key, false);
        let item: Item;

        if (this._ss[commonPath]) {
            item = new Item(key, true, true);
        } else if (this._ss[basePath]) {
            item = new Item(key, true, false);
        } else if (this._ls[commonPath]) {
            item = new Item(key, false, true);
        } else if (this._ls[basePath]) {
            item = new Item(key, false, false);
        }
        return item;
    }

    /**
     * Gets the item from the local / session storage
     * @param item Item
     */
    get(item: Item) {
        const path = this._path(item);
        const json = this._storage(item).getItem(path);
        return JSON.parse(json);
    }

    /**
     * Sets the item into local / session storage
     * @param item Item
     * @param val string | number | boolean | object | Array<any>
     */
    set(item: Item, val: string | number | boolean | object | Array<any>) {
        const path = this._path(item);
        const json = JSON.stringify(val);
        this._storage(item).setItem(path, json);
        return true;
    }

    /**
     * Removes the item from local / session storage
     * @param item Item
     */
    remove(item: Item) {
        const path = this._path(item);
        this._storage(item).removeItem(path);
        return true;
    }

    /**
     * Returns the local or session storage pointer
     * @param item Item
     */
    private _storage(item: Item) {
        return item.expires ? this._ss : this._ls;
    }
}