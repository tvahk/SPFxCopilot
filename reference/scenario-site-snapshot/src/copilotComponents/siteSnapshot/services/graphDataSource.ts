/**
 * Site Snapshot - PnPjs Graph data source.
 * ===========================================================================
 * SPFx 1.24 PREVIEW - VERIFY BEFORE YOU RELY ON THIS.
 *
 * This implements the same ISnapshotDataSource seam using PnPjs (@pnp/graph),
 * so the UI is unchanged when you switch from mock to real data.
 *
 * IMPORTANT preview caveat: PnPjs's SPFx() behaviour reads pageContext and the
 * token factories off the SPFx context. A Copilot component's context is NOT
 * documented to expose those, so `graphfi().using(SPFx(context))` may not bind
 * in the Copilot canvas. Treat this as unverified on 1.24. If it does not work:
 *   1. Fall back to AadHttpClient (if the context exposes aadHttpClientFactory), or
 *   2. Move data fetching to the agent's tool/action layer and pass results into
 *      the component as properties (the presentation-first pattern), or
 *   3. Keep MockDataSource for the Workbench and wire real data in a companion
 *      classic web part where the full WebPartContext is available.
 *
 * Required Graph permissions (declare in package-solution.json, approve in the
 * SharePoint Admin Center): Sites.Read.All, Files.Read.All, Mail.Send.
 */

import { graphfi, SPFx, GraphFI } from '@pnp/graph';
import '@pnp/graph/sites';
import '@pnp/graph/files';
import '@pnp/graph/permissions/drive-item';
import '@pnp/graph/users';
import '@pnp/graph/mail/messages';

import {
  ISnapshotDataSource,
  IResolvedSite,
  IStorage,
  IItemScan,
} from './dataSource';
import { IAnalyzeArgs, IExternalShare } from '../models/types';

// Throttle-safe caps. Tune these in M6.
const MAX_ITEMS_SCANNED = 500;
const PERM_BATCH_SIZE = 10;

/** Replace with your tenant's real internal domain(s). */
const INTERNAL_DOMAINS = ['@yourtenant.onmicrosoft.com', '@yourtenant.com'];

const isExternal = (email: string): boolean =>
  !INTERNAL_DOMAINS.some((d) => email.toLowerCase().endsWith(d));

export class GraphDataSource implements ISnapshotDataSource {
  private graph: GraphFI;

  /**
   * `context` is the Copilot component context. It is cast to `any` because the
   * preview typings do not describe the members PnPjs needs. If binding fails,
   * see the fallbacks in the file header.
   */
  public constructor(context: unknown) {
    this.graph = graphfi().using(SPFx(context as any));
  }

  public async resolveSite(siteUrl: string): Promise<IResolvedSite> {
    const u = new URL(siteUrl);
    const site = await this.graph.sites.getByUrl(u.hostname, u.pathname)();
    const drives = await this.graph.sites.getById(site.id).drives();
    const driveId = drives[0]?.id ?? '';
    return { siteName: site.displayName || site.name || u.pathname, siteId: site.id, driveId };
  }

  public async getStorage(site: IResolvedSite): Promise<IStorage> {
    const drive = await this.graph.drives.getById(site.driveId)();
    return {
      usedBytes: drive.quota?.used ?? 0,
      totalBytes: drive.quota?.total ?? 0,
    };
  }

  public async scanItems(
    site: IResolvedSite,
    args: IAnalyzeArgs,
    nowMs: number
  ): Promise<IItemScan> {
    const drive = this.graph.drives.getById(site.driveId);

    // Enumerate the library root's children, paged and capped.
    const items: any[] = [];
    let page = await drive.root.children.top(200)();
    let truncated = false;
    // PnPjs exposes paging via the collection; loop until no next page or capped.
    // (Simplified here; use the paging helper your PnPjs version provides.)
    while (page && page.length) {
      for (const it of page) {
        if (it.folder) continue; // files only for now
        items.push(it);
        if (items.length >= MAX_ITEMS_SCANNED) {
          truncated = true;
          break;
        }
      }
      if (truncated) break;
      // Fetch the next page if the API returned one; otherwise stop.
      const next: any = (page as any).next ? await (page as any).next() : undefined;
      page = next && next.length ? next : [];
    }

    const staleCutoff = nowMs - args.staleMonths * 30 * 24 * 60 * 60 * 1000;
    const staleDocs = items
      .filter((it) => Date.parse(it.lastModifiedDateTime) < staleCutoff)
      .map((it) => ({ name: it.name, webUrl: it.webUrl, modifiedIso: it.lastModifiedDateTime }));

    const largestFiles = [...items]
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, args.topN)
      .map((it) => ({ name: it.name, webUrl: it.webUrl, sizeBytes: it.size || 0 }));

    // Only permission-check items that advertise a "shared" facet (cheaper).
    const candidates = items.filter((it) => it.shared);
    const externalShares = await this.scanSharing(site.driveId, candidates);

    const lastActivityMs = items.reduce(
      (max, it) => Math.max(max, Date.parse(it.lastModifiedDateTime) || 0),
      0
    );

    return {
      staleDocs,
      largestFiles,
      externalShares,
      totalScanned: items.length,
      truncated,
      lastActivityIso: lastActivityMs ? new Date(lastActivityMs).toISOString() : undefined,
    };
  }

  /** Permission-check items in batches so we do not trip Graph throttling. */
  private async scanSharing(driveId: string, candidates: any[]): Promise<IExternalShare[]> {
    const drive = this.graph.drives.getById(driveId);
    const out: IExternalShare[] = [];

    for (let i = 0; i < candidates.length; i += PERM_BATCH_SIZE) {
      const batch = candidates.slice(i, i + PERM_BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (it) => {
          try {
            const perms: any[] = await drive.items.getById(it.id).permissions();
            for (const p of perms) {
              if (p.link?.scope === 'anonymous') {
                return {
                  name: it.name,
                  webUrl: it.webUrl,
                  kind: 'anyone' as const,
                  sharedWith: 'Anyone with the link',
                };
              }
              const externals = (p.grantedToIdentitiesV2 || [])
                .map((g: any) => g.user?.email)
                .filter((e: string | undefined) => !!e && isExternal(e));
              if (externals.length) {
                return {
                  name: it.name,
                  webUrl: it.webUrl,
                  kind: 'external' as const,
                  sharedWith: externals.join(', '),
                };
              }
            }
          } catch {
            // ignore a single item's permission failure; keep scanning
          }
          return undefined;
        })
      );
      results.forEach((r) => r && out.push(r));
    }
    return out;
  }

  public async sendMail(recipient: string, subject: string, html: string): Promise<void> {
    await this.graph.me.sendMail({
      message: {
        subject,
        body: { contentType: 'html', content: html },
        toRecipients: [{ emailAddress: { address: recipient } }],
      },
      saveToSentItems: true,
    } as any);
  }
}
