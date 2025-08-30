function val(obj, path) {
  return path.split(".").reduce((x, k) => (x == null ? x : x[k]), obj);
}

function simNum(a, b, min, max) {
  if (a == null || b == null) return 0;
  const range = Math.max(1e-9, (max ?? 1) - (min ?? 0));
  return 1 - Math.min(1, Math.abs(a - b) / range);
}
function simBin(a, b) {
  if (a == null || b == null) return 0;
  return (!!a) === (!!b) ? 1 : 0;
}
function simCat(a, b) {
  if (a == null || b == null) return 0;
  const sa = String(a).trim().toLowerCase();
  const sb = String(b).trim().toLowerCase();
  return sa === sb ? 1 : 0;
}

/**
 * features: [{ type:'num'|'bin'|'cat', key:'vitals.egfr', min, max, w, gate? }]
 * returns 0..1
 */
function gowerSim(user, pat, features) {
  let wsum = 0;
  let acc = 0;
  for (const f of features) {
    // ✅ NEW: optional gate to conditionally skip a feature
    if (typeof f.gate === "function" && !f.gate(user, pat)) continue;

    const u = val(user, f.key);
    const p = val(pat, f.key);
    const w = f.w ?? 1;
    let s = 0;
    if (f.type === "num") s = simNum(u, p, f.min, f.max);
    else if (f.type === "bin") s = simBin(u, p);
    else s = simCat(u, p);

    acc += w * s;
    wsum += w;
  }
  return wsum ? acc / wsum : 0;
}

module.exports = { gowerSim, val, simNum, simBin, simCat };
