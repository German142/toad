/* Who actually holds $TOAD.
 *
 * This exists because the numbers it returns need an indexed RPC, an indexed
 * RPC needs a paid key, and a paid key must never sit in a page anyone can
 * read. The key lives in the environment here and never leaves.
 *
 * It is deliberately not a proxy. There is no method parameter and no mint
 * parameter: it answers exactly one question about exactly one token, so it
 * cannot be turned into somebody else's free RPC. An open proxy on a public
 * domain is somebody else's quota within a day.
 *
 * The obvious call for "who holds the most" is getTokenLargestAccounts, and
 * Helius deprioritises it -- it answers "Request deprioritized due to number
 * of accounts requested" rather than failing outright, which is easy to
 * mistake for a network problem. Walking the token accounts once gives the
 * count and the largest holders from the same pass, and is a call it is happy
 * to serve.
 */
const MINT = 'A13oRB9FFaiUjfi6LdCg6p9ka1u8SfGkUFs4SKvPpump';
const PAGE = 1000;
const MAX_PAGES = 60;                 // 60k accounts, and bounded on purpose

async function call(url, method, params) {
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'GET only' });
  }
  const url = process.env.SOLANA_RPC;
  if (!url) {
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(200).json({ error: 'no node configured', keyed: false });
  }

  try {
    const supply = await call(url, 'getTokenSupply', [MINT]);
    const decimals = Number(supply?.value?.decimals ?? 6);
    const total = Number(supply?.value?.uiAmount) || 0;
    const unit = 10 ** decimals;

    /* One pass: every holder is counted and the largest are kept as we go,
       so the top twenty and the count can never disagree with each other. */
    const owners = new Map();
    let page = 1, truncated = false;
    for (; page <= MAX_PAGES; page++) {
      const r = await call(url, 'getTokenAccounts',
        { mint: MINT, limit: PAGE, page, options: { showZeroBalance: false } });
      const list = r?.token_accounts || [];
      for (const a of list) {
        const n = Number(a.amount) || 0;
        if (n <= 0) continue;
        /* Keyed by owner, not by token account: one person with three
           accounts is one holder, and counting accounts would inflate both
           numbers in a way that flatters the token. */
        owners.set(a.owner, (owners.get(a.owner) || 0) + n);
      }
      if (list.length < PAGE) break;
      if (page === MAX_PAGES) truncated = true;
    }

    const top = [...owners.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([address, raw]) => {
        const amount = raw / unit;
        return { address, amount, share: total ? +(amount / total * 100).toFixed(2) : null };
      });

    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    return res.status(200).json({
      mint: MINT,
      supply: total,
      holders: owners.size,
      truncated,                                   // true if the walk hit its bound
      top,
      topShare: +top.reduce((n, t) => n + (t.share || 0), 0).toFixed(2),
      keyed: true,
      at: new Date().toISOString(),
    });
  } catch (e) {
    res.setHeader('Cache-Control', 'public, s-maxage=15');
    return res.status(200).json({ error: String(e.message || e), keyed: true });
  }
}
