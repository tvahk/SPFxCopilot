/**
 * Site Snapshot - tool parameter schemas (Zod).
 * ===========================================================================
 * One exported schema per tool. Keep them in sync with:
 *   - the component .manifest.json  tools[].propertiesSchema
 *   - copilot/ai-plugin.json        functions[].parameters
 *
 * Model the schema tightly: narrow types and good .describe() text help the
 * model pass the right arguments.
 */

import { z } from 'zod';

/** analyzeSite - the main tool. All parameters optional with sensible defaults. */
export const AnalyzeSiteProperties = z.object({
  siteUrl: z
    .string()
    .url()
    .optional()
    .describe('Absolute URL of the site to analyse. Omit to use the current site.'),
  staleMonths: z
    .number()
    .int()
    .min(1)
    .max(60)
    .default(6)
    .describe('A document is stale if it has not been modified within this many months.'),
  topN: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe('How many of the largest files to list.'),
});

/** exportSnapshot - no parameters; downloads the current snapshot as CSV. */
export const ExportSnapshotProperties = z
  .object({})
  .describe('Export the current snapshot detail rows to a CSV file.');

/** emailSnapshot - the real side effect. */
export const EmailSnapshotProperties = z.object({
  recipient: z
    .string()
    .email()
    .optional()
    .describe('Email address to send the snapshot to. Omit to send to the current user.'),
});

export type AnalyzeSiteArgs = z.infer<typeof AnalyzeSiteProperties>;
export type EmailSnapshotArgs = z.infer<typeof EmailSnapshotProperties>;
