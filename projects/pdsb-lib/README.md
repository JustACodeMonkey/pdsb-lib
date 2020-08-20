# pdsb-lib
This library contains two simple services that can be used with projects at the Peel District School Board.

# StorageManagerService
- Simple web storage manager to work with multiple apps under the same domain.
- The manager will use local / session storage if available.
- Otherwise, it will revert to using cookies.

### Information
- Items that are common across applications are prefixed with '/sis/', otherwise, they are prefixed with '/BASE_HREF/'.
- When using local / session storage, items set to expire use sessionStorage, otherwise, localStorage is used.
- In the case of cookies, items set to persist are appended with '/!' to signify a non-session cookie.

### Usage
- StorageManagerService is provided in root, so simply inject where required.

#### get(key: string): string 
- Returns the object stored at the given key

#### set(key: string, val: string | number | boolean | object | Array<any>, expires: boolean = true, common: boolean = false): boolean
- Sets the object by storing it in local or session storage (or to a cookie)

#### remove(key: string, track: boolean = true)
- Removes an item from either the local or session storage (or from a cookie)

#### removeAll(force: boolean = true)
- Removes all session storage items either for the app only, or for the '/common/' items as well

# WindowManagerService
- A simple manager to open/close windows and handle communication between parent/child windows

### Usage
- WindowManagerService is provided in root, so simply inject where required.

### get parentWindow()
- Returns a reference to the parent window.

### get thisWindow()
- Returns a reference to the current window.

### open(url: string, name: string)
- Opens a child window.

### close(name: string)
- Closes a child window.

### closeAll()
- Closes all child windows.

### postToChild(name: string, message: any, targetOrigin: string = '*')
- Posts a message from the parent to a child window.

### postToParent(message: any, targetOrigin: string = '*')
- Posts a message from a child to the parent window.
