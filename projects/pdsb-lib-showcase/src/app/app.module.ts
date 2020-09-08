import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PdsbLibModule } from 'projects/pdsb-lib/src/lib/pdsb-lib.module';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        PdsbLibModule.forRoot({
            apiRoot: '',
            version: '1.00'
        })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
