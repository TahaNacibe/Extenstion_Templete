# Extension UI Development Guide

This repository is a **Vite + React + Tailwind UI extension** designed to be:

- Built as **static files**
- Loaded dynamically by a **host application**
- Rendered inside an **iframe**
- Communicating with the host via **`postMessage` APIs**

This is **not** a Chrome/Firefox extension.  
It is an **extension module** consumed by a larger app.

---

## 1. Project Purpose

Each extension is a **self-contained UI bundle** that:

- Is built using Vite
- Outputs static HTML, JS, and CSS
- Is loaded at runtime from `/extensions/{EXT_ID}/index.html`
- Talks to the host app through a **strict, message-based API**

---

## 2. Project Structure

```
extension-project/
├─ index.html
├─ vite.config.js
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  └─ index.css
├─ setup/
│  └─ manifest.json   ← TEMPLATE ONLY
└─ dist/              ← GENERATED (after build)
```

---

## 3. Development Workflow

### Install dependencies

```bash
npm install
```

### Run live development server (UI preview)

```bash
npm run dev
```

This:
- Starts Vite dev server
- Enables HMR (hot reload)
- Is intended for **UI development only**
- Does NOT reflect real extension loading

Use this to build and test UI safely.

### Build production extension files

```bash
npm run build
```

This generates a **static bundle** in `dist/`.

---

## 4. Required Build Output

After `npm run build`, the `dist/` folder **must contain**:

```
dist/
├─ index.html
├─ assets/
│  ├─ *.js
│  └─ *.css
├─ icon.svg (or png)
└─ manifest.json
```

If any of these are missing, the extension is considered **invalid**.

---

## 5. Vite Configuration (IMPORTANT)

The extension **must work from any path**:

```
/extensions/{EXT_ID}/index.html
```

For this reason, **relative assets are mandatory**.

### `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    assetsDir: 'assets',
    emptyOutDir: true,
  },
})
```

This ensures:
- JS/CSS load from `./assets/...`
- The extension works inside an iframe
- No hardcoded root paths

---

## 6. Manifest File

Each extension **must include a `manifest.json`** at the root of the built output.

### Template (located in `setup/manifest.json`)

```json
{
  "id": "UNIQUE_ID",
  "name": "EXTENSION_NAME_COMPLETED",
  "version": "EXTENSION_VERSION",
  "description": "EXTENSION_DESCRIPTION_COMPLETED",
  "main": "index.html",
  "icon": "YOUR_ICON_NAME",
  "author": "YOUR_NAME_OR_PIN_NAME",
  "license": "MIT"
}
```

### Notes

- `id` **must be unique**
- `main` must always point to an HTML file
- `icon` must exist in the root of the extension
- This file is read by the host app, not the browser

---

## 7. Packaging the Extension

Extensions are distributed as **ZIP files**.

### Final ZIP structure

```
my-extension.zip
├─ index.html
├─ manifest.json
├─ icon.svg
└─ assets/
   ├─ index-xxxxx.js
   └─ index-yyyyy.css
```

### Rules

- ZIP **must not** include `node_modules`
- ZIP **must not** include source files
- Only built output is allowed

---

## 8. Host ↔ Extension Communication API

Extensions communicate with the host app using `postMessage`.

### Request format (from extension)

```ts
{
  type: string;
  payload: {
    requestId: string;
    ...data
  };
}
```

### Response format (from host)

```ts
{
  type: 'apiResponse';
  payload: {
    requestId: string;
    success: boolean;
    data?: any;
    error?: string;
  };
}
```

---

## 9. Allowed APIs (CURRENT)

Only the following request types are supported. Any other request will be rejected.

### 1️⃣ `requestDb`

Fetch data from the extension’s own storage.

**Required payload fields**
- `collection_name`
- `ext_id`
- `user_id`

**Optional**
- `fetch_count`
- `target_id`
- `order_by` (`asc` | `desc`)

### 2️⃣ `requestExternalDb`

Fetch data from another extension (with allow-list validation you must be validated by your target).

**Required**
- `targetExt_id`
- `collection_name`
- `activeExt_id`
- `user_id`

**Optional**
- `fetch_count`
- `targetItem_id`
- `order_by`

### 3️⃣ `requestExternalLink`

Perform an external HTTP request via the host.

**Required**
- `endpoint`
- `request_type` (`GET`, `POST`, etc.)

**Optional**
- `data`

### 4️⃣ `requestSocial`

Social and user-related actions.

**Required**
- `user_id`

**Actions**
- `friendList`
- `profile`

---

## 10. Message Handling Rules

- Messages are only accepted from the extension iframe
- Source is validated via `iframe.contentWindow`
- Every request **must include `requestId`**
- Responses always echo back `requestId`

Failure to follow this contract will result in ignored requests.

---

## 11. Security Notes

- Extensions run in a sandboxed iframe
- No direct access to host APIs
- All privileged actions go through the message bridge
- No DOM access outside the iframe

This is **intentional**.

---

## 12. Summary

To create a valid extension:

1. Build UI with `npm run dev`
2. Generate static files with `npm run build`
3. Add `manifest.json` and icon
4. Zip the output
5. Load via host app

If it works in `dist/`, it will work everywhere.

