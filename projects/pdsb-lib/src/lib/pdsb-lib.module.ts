import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { AlertComponent } from './components/alert/alert.component';
import { InactivityManagerComponent } from './inactivity-manager/inactivity-manager.component';

@NgModule({
    declarations: [
        // Components
        AlertComponent,
        InactivityManagerComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        MatDialogModule
    ],
    exports: [
        // Components
        AlertComponent,
        InactivityManagerComponent
    ]
})
export class PdsbLibModule { }
