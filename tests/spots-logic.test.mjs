// tests/spots-logic.test.mjs — standalone, no build needed.
// Mirrors geo.ts haversine + the GPS-gate / one-per-day rules in SpotsContext.
// Run: node tests/spots-logic.test.mjs

import assert from "node:assert/strict";

const GATE = 100; // RULES.GPS_GATE_METERS
const EARTH = 6_371_000;
const toRad = (d) => (d * Math.PI) / 180;
function distanceMeters(a, b) {
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
}
const dateKey = (ts = Date.now()) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
};
const withinGate = (dist) => dist <= GATE;
const collectedToday = (checkIns, userId, spotId, now = Date.now()) =>
  checkIns.some((c) => c.spotId === spotId && c.userId === userId && dateKey(c.timestamp) === dateKey(now));

let pass = 0;
const t = (n, fn) => { fn(); pass++; console.log("  ✓ " + n); };

const stoner = { lat: 34.0411, lng: -118.4486 };

console.log("haversine");
t("zero distance", () => assert.equal(Math.round(distanceMeters(stoner, stoner)), 0));
t("~111m per 0.001 lat", () => { const d = distanceMeters({lat:0,lng:0},{lat:0.001,lng:0}); assert.ok(d>110&&d<112,`got ${d}`); });

console.log("GPS gate");
t("standing on the spot passes", () => assert.equal(withinGate(distanceMeters(stoner, stoner)), true));
t("50m away passes", () => { const near={lat:stoner.lat+0.00045,lng:stoner.lng}; assert.ok(distanceMeters(stoner,near)<GATE); });
t("300m away fails", () => { const far={lat:stoner.lat+0.0027,lng:stoner.lng}; assert.equal(withinGate(distanceMeters(stoner,far)),false); });
t("couch (5km) fails hard", () => { const couch={lat:stoner.lat+0.045,lng:stoner.lng}; assert.equal(withinGate(distanceMeters(stoner,couch)),false); });

console.log("one-per-day");
const DAY = 86_400_000;
t("no history → not collected", () => assert.equal(collectedToday([], "me", "spot_stoner"), false));
t("checked in today → collected", () => {
  const h=[{spotId:"spot_stoner",userId:"me",timestamp:Date.now()}];
  assert.equal(collectedToday(h,"me","spot_stoner"),true);
});
t("checked in yesterday → not collected today", () => {
  const h=[{spotId:"spot_stoner",userId:"me",timestamp:Date.now()-DAY}];
  assert.equal(collectedToday(h,"me","spot_stoner"),false);
});
t("other user's check-in doesn't count", () => {
  const h=[{spotId:"spot_stoner",userId:"someone",timestamp:Date.now()}];
  assert.equal(collectedToday(h,"me","spot_stoner"),false);
});

console.log(`\nAll ${pass} tests passed ✅`);
