import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PdsbLibModule } from 'projects/pdsb-lib/src/lib/pdsb-lib.module';
import { AlertsComponent } from './pages/alerts/alerts.component';
import { LoginComponent } from './pages/login/login.component';
import { ServicesComponent } from './pages/services/services.component';
import { HtmlLoaderComponent } from './pages/html-loader/html-loader.component';

@NgModule({
    declarations: [
        AppComponent,
        AlertsComponent,
        LoginComponent,
        ServicesComponent,
        HtmlLoaderComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        PdsbLibModule.forRoot({
            apiRoot: '',
            version: '',
            isSISapp: false
        }),
        MatTabsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
