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
/**
 * Rank top-N most similar patients.
 */
function rankTopSimilar(target, patients, features, topN = 12, idFn = p => p._id || p.id) {
  const scored = patients.map(p => ({
    id: idFn(p),
    score: gowerSim(target, p, features),
    patient: p,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}

/**
 * Pretty-print ranked results in terminal.
 */
function printRankTable(ranked, columns = []) {
  const rows = ranked.map((r, i) => {
    const row = {
      '#': i + 1,
      id: r.id,
      score: Number((r.score * 100).toFixed(2)) + '%',
    };
    for (const c of columns) row[c] = val(r.patient, c);
    return row;
  });
  console.table(rows);
}
function gowerWithBreakdown(a, b, features) {
  let wsum = 0, acc = 0;
  const parts = [];
  for (const f of features) {
    if (typeof f.gate === "function" && !f.gate(a, b)) continue;

    const u = val(a, f.key);
    const p = val(b, f.key);
    const w = f.w ?? 1;

    let s = 0;
    if (f.type === "num") {
      const range = Math.max(1e-9, (f.max ?? 1) - (f.min ?? 0));
      s = (u == null || p == null) ? 0 : 1 - Math.min(1, Math.abs(u - p) / range);
    } else if (f.type === "bin") {
      s = (u == null || p == null) ? 0 : ((!!u) === (!!p) ? 1 : 0);
    } else {
      const su = u == null ? "" : String(u).trim().toLowerCase();
      const sp = p == null ? "" : String(p).trim().toLowerCase();
      s = (su && sp && su === sp) ? 1 : 0;
    }

    acc += w * s;
    wsum += w;
    parts.push({
      key: f.key,
      type: f.type,
      weight: w,
      valueA: u,
      valueB: p,
      sim: +s.toFixed(4),
      contribution: +(w * s),
    });
  }
  const score = wsum ? acc / wsum : 0;
  return { score, parts, wsum, acc };
}

function printBreakdownRow(target, patient, features) {
  const { score, parts, wsum } = gowerWithBreakdown(target, patient, features);
  console.log(`\nTotal: ${(score * 100).toFixed(2)}%  (weighted sum / ${wsum.toFixed(2)})`);
  console.table(parts.map(p => ({
    feature: p.key,
    type: p.type,
    weight: p.weight,
    A: p.valueA,
    B: p.valueB,
    sim: p.sim,
    contrib: +p.contribution.toFixed(4),
  })));
}

module.exports = {
  gowerSim,
  val,
  simNum,
  simBin,
  simCat,
  rankTopSimilar,
  printRankTable,
  gowerWithBreakdown,
  printBreakdownRow,
};
