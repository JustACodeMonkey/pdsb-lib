import { SafeHtml } from '@angular/platform-browser';

export interface IAlert {
    title?: string;
    message: string | SafeHtml;
    buttonText1?: string;
    buttonText2?: string;
    buttonText3?: string;
    showButton2?: boolean;
    showButton3?: boolean;
}
