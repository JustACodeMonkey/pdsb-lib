import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AlertComponent } from './components/alert/alert.component';
import { InactivityManagerComponent } from './inactivity-manager/inactivity-manager.component';
import { PrintManagerComponent } from './print-manager/print-manager.component';
import { LoginComponent } from './components/login/login.component';
import { HtmlLoaderComponent } from './components/html-loader/html-loader.component';
import { PdsbLibConfiguration } from './lib-configuration';

class PdsbLibDefaultConfiguration extends PdsbLibConfiguration {
    apiRoot         = '';
    version         = '';
    isSISapp        = true;
    assumeParentApp = true;
    inactivityManagerSecondsUntilWarning = 1080;
    inactivityManagerSecondsToWarn       = 120;
    tokenManagerIntervalTime             = 1000 * 60 * 20; // 20 minutes
}

@NgModule({
    declarations: [
        // Components
        AlertComponent,
        HtmlLoaderComponent,
        InactivityManagerComponent,
        PrintManagerComponent,
        LoginComponent
    ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        FlexLayoutModule
    ],
    exports: [
        // Components
        AlertComponent,
        HtmlLoaderComponent,
        InactivityManagerComponent,
        LoginComponent,
        PrintManagerComponent,
        // Material modules (so they are available to the app)
        // Note that the app must import and set Material theming
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        FlexLayoutModule
    ]
})
export class PdsbLibModule {
    static forRoot(options: PdsbLibConfiguration): ModuleWithProviders<PdsbLibModule> {
        // Apply the default options if they weren't included
        const config = new PdsbLibDefaultConfiguration();
        Object.keys(config).forEach(key => {
            config[key] = options.hasOwnProperty(key) ? options[key] : config[key];
        });
        return {
            ngModule: PdsbLibModule,
            providers: [
                {
                    provide: PdsbLibConfiguration,
                    useValue: config
                }
            ]
        }
    }
}
