/**
 * Site Snapshot - the data-source seam.
 * ===========================================================================
 * THE most important design decision in this build.
 *
 * A Copilot component's context is only documented to expose domElement,
 * hostContext (theme, displayMode), and requestDisplayModeAsync. It is NOT
 * documented to expose the token or Graph factories that PnPjs and many SPFx
 * controls rely on. So do not couple the UI to Graph directly.
 *
 * Instead, the UI depends on this small interface. Two implementations satisfy
 * it: a mock (build and demo the UI with no tenant) and a PnPjs Graph one
 * (real data, with a preview caveat). Swapping them changes nothing in the UI.
 */

import {
  IStaleDoc,
  ILargeFile,
  IExternalShare,
  IAnalyzeArgs,
} from '../models/types';

/** A resolved site plus its default drive. */
export interface IResolvedSite {
  siteName: string;
  siteId: string;
  driveId: string;
}

/** Storage figures for a drive. */
export interface IStorage {
  usedBytes: number;
  totalBytes: number;
}

/** The result of scanning items in a library. */
export interface IItemScan {
  staleDocs: IStaleDoc[];
  largestFiles: ILargeFile[];
  externalShares: IExternalShare[];
  totalScanned: number;
  truncated: boolean;
  lastActivityIso: string | undefined;
}

/**
 * Everything the snapshot orchestration needs, and nothing about how it is
 * fetched. Implement this with mock data or with PnPjs Graph.
 */
export interface ISnapshotDataSource {
  resolveSite(siteUrl: string): Promise<IResolvedSite>;
  getStorage(site: IResolvedSite): Promise<IStorage>;
  scanItems(site: IResolvedSite, args: IAnalyzeArgs, nowMs: number): Promise<IItemScan>;
  sendMail(recipient: string, subject: string, html: string): Promise<void>;
}
