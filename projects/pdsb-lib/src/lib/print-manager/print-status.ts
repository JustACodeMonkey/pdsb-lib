import { PrintServer } from './print-server';

export class PrintStatus {
    static readonly STATUS_FAILED     = 0;
    static readonly STATUS_ACCEPTED   = 1;
    static readonly STATUS_OPENING    = 2;
    static readonly STATUS_INITIALIZE = 3;
    static readonly STATUS_READY      = 4;
    static readonly STATUS_ERROR      = 5;
    static readonly STATUS_EXPIRED    = 12;

    jobId  = 0;
    status = 0;
    msg    = '';
    server: PrintServer;
}
