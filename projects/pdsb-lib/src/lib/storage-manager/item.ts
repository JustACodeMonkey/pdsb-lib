export class Item {
    // The storage key
    key: string;

    // Whether or not the item expires
    expires: boolean;

    // Whether or not the item should be saved to the common (/sis/) path or not
    common: boolean;

    constructor(key: string, expires: boolean = true, common: boolean = false) {
        this.key = key;
        this.expires = expires;
        this.common = common;
    }
}
