import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { PdsbLibConfig } from './classes/pdsb-lib-config';
import { LoginComponent } from './components/login/login.component';

@NgModule({
    declarations: [
        // Components
        AlertComponent,
        InactivityManagerComponent,
        PrintManagerComponent,
        LoginComponent
    ],
    imports: [
        CommonModule,
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
        InactivityManagerComponent,
        PrintManagerComponent
    ]
})
export class PdsbLibModule {
    static forRoot (
        pdsbLibConfig: PdsbLibConfig
    ): ModuleWithProviders<PdsbLibModule> {
        return {
            ngModule: PdsbLibModule,
            providers: [
                {
                    provide: PdsbLibConfig,
                    useValue: pdsbLibConfig
                }
            ]
        }
    }
}
