// Public list endpoints (/api/services|careers|blogs.php return `{ success, data: [] }`): one request
// per URL per page session, shared by every screen that shows the list, so a revisited screen renders
// its rows at once (the useContent policy: admin edits show after a reload). Only a successful list is
// kept; a failed request is dropped so the next visit retries.
const lists = new Map<string, unknown[]>();
const pending = new Map<string, Promise<unknown[]>>();

/** The list already loaded for `url` this session, if any (for a screen's first render). */
export function peekList(url: string): unknown[] | undefined {
  return lists.get(url);
}

/** Resolves with the `data` rows of `url`; rejects on a network/HTTP error or an unsuccessful response. */
export function fetchList(url: string): Promise<unknown[]> {
  const loaded = lists.get(url);
  if (loaded) return Promise.resolve(loaded);
  let request = pending.get(url);
  if (!request) {
    request = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((result): unknown[] => {
        if (result?.success !== true || !Array.isArray(result.data)) throw new Error('List unavailable');
        lists.set(url, result.data);
        return result.data;
      })
      .finally(() => pending.delete(url));
    pending.set(url, request);
  }
  return request;
}

/** Drops every cached list (call after an admin change so the public screens reload it). */
export function clearListCache() {
  lists.clear();
}
