/**
 * Site Snapshot - mock data source.
 * ===========================================================================
 * Build the whole UI against this first. It needs no tenant, no permissions,
 * and no Graph, so the inline card and fullscreen dashboard work in the Copilot
 * Workbench from milestone M1. When the real Graph source is ready, swap it in
 * without touching a single component.
 */

import {
  ISnapshotDataSource,
  IResolvedSite,
  IStorage,
  IItemScan,
} from './dataSource';
import { IAnalyzeArgs } from '../models/types';

/** A deterministic set of realistic sample data. */
export class MockDataSource implements ISnapshotDataSource {
  public async resolveSite(siteUrl: string): Promise<IResolvedSite> {
    return {
      siteName: 'Project Aurora',
      siteId: 'mock-site-id',
      driveId: 'mock-drive-id',
    };
  }

  public async getStorage(_site: IResolvedSite): Promise<IStorage> {
    return { usedBytes: 4.2 * 1024 ** 3, totalBytes: 25 * 1024 ** 3 };
  }

  public async scanItems(
    _site: IResolvedSite,
    args: IAnalyzeArgs,
    _nowMs: number
  ): Promise<IItemScan> {
    return {
      staleDocs: [
        { name: 'Q1-plan-2023.docx', webUrl: '#', modifiedIso: '2023-02-11T09:00:00Z' },
        { name: 'old-brand-guide.pdf', webUrl: '#', modifiedIso: '2022-11-03T09:00:00Z' },
        { name: 'archived-notes.txt', webUrl: '#', modifiedIso: '2023-05-20T09:00:00Z' },
      ],
      largestFiles: [
        { name: 'launch-video.mp4', webUrl: '#', sizeBytes: 820 * 1024 ** 2 },
        { name: 'design-assets.zip', webUrl: '#', sizeBytes: 410 * 1024 ** 2 },
        { name: 'budget-2026.xlsx', webUrl: '#', sizeBytes: 12 * 1024 ** 2 },
      ],
      externalShares: [
        { name: 'Q4-plan.docx', webUrl: '#', kind: 'anyone', sharedWith: 'Anyone with the link' },
        { name: 'budget-2026.xlsx', webUrl: '#', kind: 'external', sharedWith: 'ext@acme.com' },
      ],
      totalScanned: 137,
      truncated: false,
      lastActivityIso: '2026-08-30T09:00:00Z',
    };
  }

  public async sendMail(recipient: string, subject: string, _html: string): Promise<void> {
    // No real send in mock mode; log-free no-op so the UI flow can be exercised.
    return;
  }
}
