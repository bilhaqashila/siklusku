import { readFile } from "node:fs/promises";
import { strict as assert } from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcRoot = path.join(__dirname, "..", "src");

async function readSource(relativePath) {
  const normalized = relativePath.split("/");
  return readFile(path.join(srcRoot, ...normalized), "utf8");
}

test("layout exposes accessible skip link", async () => {
  const layout = await readSource("app/layout.js");
  assert.match(layout, /href="#main-content"/);
  assert.match(layout, /Lewati ke konten utama/);
});

test("siklusku main region has landmark", async () => {
  const page = await readSource("app/siklusku/page.jsx");
  assert.match(page, /<main id="main-content"/);
  assert.match(page, /role="main"/);
});

test("onboarding form preserves aria guidance", async () => {
  const onboarding = await readSource("components/siklus/CycleOnboarding.jsx");
  assert.match(onboarding, /aria-describedby={endDescribedBy \|\| undefined}/);
  assert.match(onboarding, /id="onboarding-error-message"/);
  assert.match(onboarding, /ref={stepHeadingRef} tabIndex={-1}/);
});

test("calendar range forwards aria state", async () => {
  const calendar = await readSource("components/siklus/CalendarRange.jsx");
  assert.match(calendar, /aria-invalid=\{ariaInvalid \? "true" : undefined}/);
  assert.match(calendar, /aria-describedby=\{ariaDescribedBy}/);
});
