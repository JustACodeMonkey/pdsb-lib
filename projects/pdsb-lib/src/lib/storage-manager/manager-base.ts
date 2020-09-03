import { Item } from './item';
import { DocRef } from './doc-ref';

/**
 * Common code made available to the Cookie and Session managers
 */
export class ManagerBase {

    private readonly BASE: string;      // The base URL for the app
    private readonly COMMON = '/sis/';  // The common URL for the app

    /**
     * Determines the applications base HREF and initialized the _tracker Item
     */
    constructor() {
        // Set the base for app-specific keys
        const bases = DocRef.doc.getElementsByTagName('base');
        if (bases.length > 0) {
            this.BASE = bases[0].attributes['href'].nodeValue as string;
        } else {
            this.BASE = '/';
        }
    }

    /**
     * Returns the path for the specific item
     * @param item Item
     */
    protected _path(item: Item): string {
        return (item.common ? this.COMMON : this.BASE) + item.key;
    }

    /**
     * Returns the path for the key / common combination
     * @param key string
     * @param common boolean
     */
    protected _pathFromKey(key: string, common: boolean): string {
        return (common ? this.COMMON : this.BASE) + key;
    }
}
