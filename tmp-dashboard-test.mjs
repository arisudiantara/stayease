const tabs = await fetch('http://127.0.0.1:9222/json').then((r) => r.json());
const page = tabs.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let seq = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
};

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const response = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.result?.exceptionDetails) {
    throw new Error(response.result.exceptionDetails.text);
  }
  return response.result?.result?.value;
};

const waitFor = async (expression, expected, timeout = 8000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const value = await evaluate(expression);
      if (value === expected) return value;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timeout: ${expression} !== ${expected}`);
};

const setValue = (id, value) =>
  evaluate(`(() => {
    const el = document.getElementById(${JSON.stringify(id)});
    el.value = ${JSON.stringify(value)};
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);

const click = (selector) =>
  evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    el.click();
    return true;
  })()`);

const text = (selector) =>
  evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent`);

const submitForm = () =>
  evaluate('document.getElementById("form-kamar").requestSubmit(); true');

const openForm = () => click('#btn-tambah');

const results = [];
const report = (label, value) => results.push([label, value]);

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:5173' });
await waitFor('document.querySelectorAll(".kamar-card").length', 6);
await evaluate('localStorage.clear(); true');
await send('Page.reload');
await waitFor('document.querySelectorAll(".kamar-card").length', 6);
await click('[data-view-link="dashboard"]');
await waitFor('document.getElementById("view-dashboard").hidden', false);

report('dashboard total', await text('#total-kamar'));
report('dashboard tersedia', await text('#total-tersedia'));
report('kategori', await evaluate('[...document.querySelectorAll(".ringkasan-chip")].map((el) => el.textContent)'));
report('table rows', await evaluate('document.querySelectorAll("#tabel-kamar-body tr").length'));
report('storage payload', await evaluate('(() => { const p = JSON.parse(localStorage.getItem("stayease.kamar.v1")); return { version: p.version, jumlah: p.kamar.length }; })()'));

// Add
await openForm();
await setValue('field-nama', 'Kamar Uji Tambah');
await setValue('field-tipe', 'Deluxe');
await setValue('field-harga', '375000');
await setValue('field-kapasitas', '3');
await setValue('field-deskripsi', 'Kamar uji tambah dari dashboard.');
await submitForm();
await waitFor('document.getElementById("dialog-form").open', false);
report('after add total', await text('#total-kamar'));
report('after add rows', await evaluate('document.querySelectorAll("#tabel-kamar-body tr").length'));
report('after add catalog cards', await evaluate('document.querySelectorAll(".kamar-card").length'));
report('after add storage count', await evaluate('JSON.parse(localStorage.getItem("stayease.kamar.v1")).kamar.length'));

// Validation
await openForm();
await setValue('field-nama', '');
await setValue('field-harga', '-1');
await setValue('field-kapasitas', '0');
await submitForm();
report('validation errors', await evaluate('[...document.querySelectorAll(".form-error:not([hidden])")].map((el) => el.textContent)'));
report('validation total unchanged', await text('#total-kamar'));
report('validation dialog open', await evaluate('document.getElementById("dialog-form").open'));
await click('#btn-batal-form');

// Edit
await evaluate(`(() => {
  const row = [...document.querySelectorAll('#tabel-kamar-body tr')].find((tr) => tr.textContent.includes('Kamar Melati'));
  row?.querySelector('[data-aksi="ubah"]')?.click();
  return Boolean(row);
})()`);
await setValue('field-nama', 'Kamar Melati Baru');
await setValue('field-harga', '300000');
await submitForm();
await waitFor('document.getElementById("dialog-form").open', false);
report('edited dashboard row', await evaluate('[...document.querySelectorAll("#tabel-kamar-body tr")].some((tr) => tr.textContent.includes("Kamar Melati Baru"))'));
report('edited catalog card', await evaluate('[...document.querySelectorAll(".kamar-card__nama")].some((el) => el.textContent === "Kamar Melati Baru")'));
report('edited price', await evaluate('[...document.querySelectorAll("#tabel-kamar-body tr")].find((tr) => tr.textContent.includes("Kamar Melati Baru"))?.textContent.includes("Rp300.000")'));

// Toggle
await evaluate(`(() => {
  const row = [...document.querySelectorAll('#tabel-kamar-body tr')].find((tr) => tr.textContent.includes('Kamar Melati Baru'));
  row?.querySelector('[data-aksi="toggle"]')?.click();
  return true;
})()`);
report('after toggle tersedia', await text('#total-tersedia'));
report('toggle reflected in catalog', await evaluate('[...document.querySelectorAll(".kamar-card")].find((card) => card.textContent.includes("Kamar Melati Baru"))?.querySelector("button.btn--disabled")?.textContent'));

// Delete with confirmation
await evaluate(`(() => {
  const row = [...document.querySelectorAll('#tabel-kamar-body tr')].find((tr) => tr.textContent.includes('Kamar Uji Tambah'));
  row?.querySelector('[data-aksi="hapus"]')?.click();
  return true;
})()`);
report('delete confirmation text', await text('#teks-hapus'));
await click('#btn-konfirmasi-hapus');
report('after delete total', await text('#total-kamar'));
report('after delete storage count', await evaluate('JSON.parse(localStorage.getItem("stayease.kamar.v1")).kamar.length'));

// Reset
await click('#btn-reset');
await click('#btn-konfirmasi-reset');
report('after reset total', await text('#total-kamar'));
report('after reset seed name', await evaluate('[...document.querySelectorAll("#tabel-kamar-body tr")].some((tr) => tr.textContent.includes("Kamar Melati")) && ![...document.querySelectorAll("#tabel-kamar-body tr")].some((tr) => tr.textContent.includes("Kamar Melati Baru"))'));

// Persistence
await evaluate(`(() => {
  const row = [...document.querySelectorAll('#tabel-kamar-body tr')].find((tr) => tr.textContent.includes('Kamar Melati'));
  row?.querySelector('[data-aksi="ubah"]')?.click();
  return true;
})()`);
await setValue('field-nama', 'Kamar Persisten');
await submitForm();
await waitFor('document.getElementById("dialog-form").open', false);
await send('Page.reload');
await waitFor('document.querySelectorAll(".kamar-card").length', 6);
await click('[data-view-link="dashboard"]');
await waitFor('document.getElementById("view-dashboard").hidden', false);
report('persisted after reload', await evaluate('[...document.querySelectorAll("#tabel-kamar-body tr")].some((tr) => tr.textContent.includes("Kamar Persisten"))'));

// XSS-safe rendering
await openForm();
await setValue('field-nama', '<img src=x onerror="window.__xss=1">');
await setValue('field-harga', '100000');
await setValue('field-kapasitas', '1');
await submitForm();
await waitFor('document.getElementById("dialog-form").open', false);
report('xss not executed', await evaluate('window.__xss === undefined'));
report('xss rendered as text', await evaluate('[...document.querySelectorAll("#tabel-kamar-body tr")].some((tr) => tr.textContent.includes("<img src=x"))'));

// Corrupt storage
await evaluate('localStorage.setItem("stayease.kamar.v1", "{"); true');
await send('Page.reload');
await waitFor('document.querySelectorAll(".kamar-card").length', 6);
report('corruption notice', await evaluate('document.getElementById("notice-pesan")?.textContent'));
report('corruption repaired payload', await evaluate('(() => { try { const p = JSON.parse(localStorage.getItem("stayease.kamar.v1")); return p.version === 1 && p.kamar.length === 6; } catch { return false; } })()'));

for (const [label, value] of results) {
  console.log(label + ':', JSON.stringify(value));
}

ws.close();
