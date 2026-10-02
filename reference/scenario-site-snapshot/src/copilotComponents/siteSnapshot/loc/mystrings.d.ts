// Site Snapshot - localized string typings.
// The standard SPFx localization pattern: strings in en-us.js, types here.

declare interface ISiteSnapshotStrings {
  AppTitle: string;
  HealthLabel: string;
  OpenBreakdown: string;
  StorageUsed: string;
  StaleDocs: string;
  ExternalShares: string;
  LargestFiles: string;
  ExportCsv: string;
  EmailMeThis: string;
  Analysing: string;
  NothingToShow: string;
}

declare module 'SiteSnapshotStrings' {
  const strings: ISiteSnapshotStrings;
  export = strings;
}
