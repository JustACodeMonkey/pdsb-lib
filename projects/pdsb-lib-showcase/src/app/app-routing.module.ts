import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AlertsComponent } from './pages/alerts/alerts.component';
import { LoginComponent } from './pages/login/login.component';
import { ServicesComponent } from './pages/services/services.component';
import { HtmlLoaderComponent } from './pages/html-loader/html-loader.component';
import { IFrameComponent } from './pages/i-frame/i-frame.component';

const routes: Routes = [
    {
        path: 'alerts',
        component: AlertsComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'html-loader',
        component: HtmlLoaderComponent
    },
    {
        path: 'services',
        component: ServicesComponent
    },
    {
        path: 'iframe',
        component: IFrameComponent
    },
    {
        path: '**',
        redirectTo: 'alerts'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
