# pdsb-lib
This library contains components and services to support SIS Angular applications at the Peel District School Board.

Apps must include
- @angular/common
- @angular/core
- @angular/material
- @angular/cdk
- @angular/flex-layout
- @ng-idle/core
- @ng-idle/keepalive

# Classes
## User
- Returned after successful login to a parent app
- Amongst other things, it holds the authentication token

## MessageData
- Describes the data that is passed between parent and child windows with the WindowManagerService

# Components
## AlertComponent
- Simple 1, 2, or 3 button alert/confirmation dialog, based on MatDialog
- IAlert defines the data

## InactivityComponent
- Count-down alert popup, based on MatDialog
- Used exclusively by InactivityManagerService

## PrintManagerComponent
- The MatDialog to initialize and monitor printing to an Oracle print server
- IPrintManagerData defines the data

# Services
## AppService
The AppService should be initialized by the application's main app.module to set up the API root and application version number. You can then use this service to get...
- the API root
- the application version number
- the server-type we're running on (prod / dev / localhost)

## AuthService
The AuthService is used to
- Set Authorization headers for HTTP requests
- Update the token information stored in the session storage
- Determine if the user has a token
- Determine if the user has a is logged in with a valid token (i.e. the token has not expired)

## PrintManagerService
The PrintManagerService works with PrintManagerComponent to handle printing to an Oracle print server
- RxJS Subjects are used to communicate between the PrintManagerComponent and page/component that is
  requesting the print

## RunModeService
The RunModeService is used to determine if the application is running as its own application, or if it is running as the child of another application

## StorageManagerService
The StorageManagerService is a simple web storage manager to work with multiple apps under the same domain.
- The manager will use local / session storage if available.
- Otherwise, it will revert to using cookies.

## TokenManagerService
Use the TokenManagerService to maintain a token
- Tokens expire every 60 minutes on the Java server
- This service refreshes tokens at 20 minute intervals to ensure it never expires (The 20 minute interval matches the inactivity timeout interval)
- Tokens are only maintained (updated) when the app is running in standalone mode (Child windows always use the token from the parent window)

## ToolsService
The ToolsService is used to display generic alerts or application error alerts. It can also be used to handle subscriber errors to return a default value

## WindowManagerService
The WindowManagerService is a simple manager to open/close windows and handle communication between parent/child windows
