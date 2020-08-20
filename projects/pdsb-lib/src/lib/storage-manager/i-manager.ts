import { Item } from './item';

export interface IManager {
    // Find an Item based on the key
    find(key: string): Item;

    // Gets the value for the associated item
    get(item: Item): string | number | boolean | object | Array<any>;

    // Sets an item into the _items array and into the storage (local / session / cookie)
    set(item: Item, val: string | number | boolean | object | Array<any>): boolean;

    // Removes an item from the _items array and from the storage (local / session / cookie)
    remove(item: Item): boolean;
}
