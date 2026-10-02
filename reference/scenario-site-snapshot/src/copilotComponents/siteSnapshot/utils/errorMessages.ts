/**
 * Site Snapshot - friendly error messages.
 * ===========================================================================
 * Raw Graph and PnPjs errors are long and ugly. Turn them into a short, safe
 * sentence for the UI, and never show a raw stack trace inside Copilot.
 */

export interface IFriendlyError {
  message: string;
  isPermission?: boolean;
  isNotFound?: boolean;
}

/** Map any thrown value to a short, user-safe message. */
export function getFriendlyError(err: unknown): IFriendlyError {
  const raw = err instanceof Error ? err.message : String(err);

  if (/401|403|forbidden|accessdenied/i.test(raw)) {
    return {
      message: 'You do not have permission to read this site.',
      isPermission: true,
    };
  }
  if (/404|not\s?found|itemnotfound/i.test(raw)) {
    return { message: 'That site or item could not be found.', isNotFound: true };
  }
  if (/429|throttl|too many requests/i.test(raw)) {
    return { message: 'Too many requests right now. Please try again shortly.' };
  }
  if (/network|failed to fetch|timeout/i.test(raw)) {
    return { message: 'A network problem stopped the request. Please retry.' };
  }

  const firstLine = raw.split('\n')[0];
  return {
    message: firstLine.length > 160 ? `${firstLine.slice(0, 160)}...` : firstLine,
  };
}
