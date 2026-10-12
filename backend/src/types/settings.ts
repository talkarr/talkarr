/* General settings */
export enum ImportIsRecordedFlagBehavior {
    skipImportIfIsNotRecorded = 'skipImportIfIsNotRecorded', // If the flag exists and is false, skip the import. If flag is missing or true, try to import the talk
    skipImportIfFlagNotExists = 'skipImportIfFlagNotExists', // If the flag does not exist, skip the import
    alwaysImport = 'alwaysImport', // Always import, regardless of the flag
}

export interface GeneralSettings {
    allowLibravatar: boolean; // Allow using Libravatar for user avatars
    importIsRecordedFlagBehavior: ImportIsRecordedFlagBehavior; // Behavior for the "is recorded" flag during import
}

/* Media management settings */
export interface MediamanagementSettings {}

/* Security settings */
export interface SecuritySettings {}

export interface Settings {
    general: GeneralSettings;
    mediamanagement: MediamanagementSettings;
    security: SecuritySettings;
}
