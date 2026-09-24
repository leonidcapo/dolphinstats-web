// Tipo de cambio venta SUNAT (referencia para mostrar el equivalente en US$).
// SUNAT protege su consulta con captcha/WAF, así que se lee un espejo público
// que publica la misma cifra oficial. Si falla, la web simplemente oculta los US$.
module.exports = async function handler(req, res) {
  try {
    const r = await fetch('https://api.apis.net.pe/v1/tipo-cambio-sunat', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    const venta = Number(d.venta);
    if (!(venta > 2 && venta < 6)) throw new Error('valor fuera de rango');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ venta: venta, compra: Number(d.compra) || null, fecha: d.fecha || null, fuente: 'SUNAT' });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'tipo de cambio no disponible' });
  }
};
