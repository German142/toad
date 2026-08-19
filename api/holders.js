/* Who actually holds $TOAD.
 *
 * This exists because the numbers it returns need an indexed RPC, an indexed
 * RPC needs a paid key, and a paid key must never sit in a page that anyone
 * can read. The key lives in the environment here and never leaves.
 *
 * It is deliberately not a proxy. There is no method parameter and no mint
 * parameter: it answers exactly one question about exactly one token, so it
 * cannot be turned into somebody else's free RPC. That matters more than the
 * flexibility it gives up -- an open proxy on a public domain is somebody
 * else's quota within a day.
 *
 * Answers are cached at the edge for a minute. Holder counts do not move
 * faster than that, and the cache is what keeps a busy day from becoming a
 * bill.
 */
const MINT = 'A13oRB9FFaiUjfi6LdCg6p9ka1u8SfGkUFs4SKvPpump';
const FALLBACK = 'https://api.mainnet-beta.solana.com';

async function rpc(url, method, params) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!r.ok) throw new Error(method + ' HTTP ' + r.status);
  const j = await r.json();
  if (j.error) throw new Error(method + ': ' + (j.error.message || 'rpc error'));
  return j.result;
}

/* Whether a provider can answer "how many hold this" is decided by asking it,
   not by looking at its hostname. The first version tested the URL for the
   word helius, which would have quietly reported no holders for any other
   indexed provider -- and reported a wrong capability for a proxy in front of
   one. Ask; if it cannot, say so. */
async function countHolders(url) {
  let page = 1, total = 0;
  while (page <= 20) {                       // 20 x 1000 is plenty, and bounded
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 'holders', method: 'getTokenAccounts',
        params: { mint: MINT, limit: 1000, page, options: { showZeroBalance: false } } }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    if (j.error) return null;                 // provider does not index this
    const list = j?.result?.token_accounts;
    if (!Array.isArray(list) || !list.length) break;
    total += list.filter(a => Number(a.amount) > 0).length;
    if (list.length < 1000) break;
    page++;
  }
  return total || null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'GET only' });
  }

  const url = process.env.SOLANA_RPC || FALLBACK;

  try {
    const [supply, largest] = await Promise.all([
      rpc(url, 'getTokenSupply', [MINT]),
      rpc(url, 'getTokenLargestAccounts', [MINT]),
    ]);

    const total = Number(supply?.value?.uiAmount) || 0;
    const top = (largest?.value || []).slice(0, 20).map(a => ({
      address: a.address,
      amount: Number(a.uiAmount) || 0,
      share: total ? +(Number(a.uiAmount) / total * 100).toFixed(2) : null,
    }));

    let holders = null;
    try { holders = await countHolders(url); } catch (e) { holders = null; }

    /* A minute at the edge: long enough that a crowd costs one call, short
       enough that the number still feels live. */
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({
      mint: MINT,
      supply: total,
      holders,                                   // null when no indexed key is configured
      top,
      topShare: +top.reduce((n, t) => n + (t.share || 0), 0).toFixed(2),
      keyed: url !== FALLBACK,
      at: new Date().toISOString(),
    });
  } catch (e) {
    /* A public endpoint rate-limits hard, and the window should say so rather
       than sit there empty pretending to load. */
    res.setHeader('Cache-Control', 'public, s-maxage=15');
    return res.status(200).json({ error: String(e.message || e), keyed: url !== FALLBACK });
  }
}
