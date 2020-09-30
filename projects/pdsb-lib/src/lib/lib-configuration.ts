export class PdsbLibConfiguration {
    // Setup for AppService (REQUIRED)
    apiRoot: string;
    version: string;
    // Setup for AuthService (OPTIONAL)
    isSISapp?: boolean;
    // Setup for InactivityManager (OPTIONAL)
    inactivityManagerSecondsUntilWarning?: number;
    inactivityManagerSecondsToWarn?: number;
    // Setup for TokenManager (OPTIONAL)
    tokenManagerIntervalTime?: number;
}
