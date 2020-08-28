import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AlertComponent } from './components/alert/alert.component';
import { InactivityManagerComponent } from './inactivity-manager/inactivity-manager.component';
import { PrintManagerComponent } from './print-manager/print-manager.component';

@NgModule({
    declarations: [
        // Components
        AlertComponent,
        InactivityManagerComponent,
        PrintManagerComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
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
export class PdsbLibModule { }
