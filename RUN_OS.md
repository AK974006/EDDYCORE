# Running the EDDYCORE (dev)

Follow these steps to run the OS UI locally during development. This starts the `web_ui` dev server (Vite) and then launches the root Electron app so the OS UI is the primary screen.

Important: this repository is an OS — AI projects such as `temp_nova_ai` are components of the OS, not the whole project. The root Electron entry (`electron-main.js`) and the `web_ui` are the primary OS UI.

Note about `npm run dev`:
- The root `dev` script uses `wait-on` so Electron will wait until the Vite dev server is responding at `http://localhost:5173` before launching the Electron window. This prevents Electron from opening the app before the dev server is ready and ensures the OS UI (not the AI client) is loaded.

1. Open a terminal and start the web UI dev server:

```powershell
cd web_ui
npm install
npm run dev
```

The dev server runs on the default Vite port (usually `5173`). Ensure it stays running.

2. In another terminal, start the root Electron app:

```powershell
cd ..
npm install
npm start
```

Notes:
- The root Electron entry is `electron-main.js` and will load the dev server when `NODE_ENV` is `development` or app is not packaged.
- If you have separate Electron apps under subfolders (for example `temp_nova_ai/electron`), run those intentionally — the root `npm start` runs the OS by default.
- If you prefer a single command to run both servers, I can add a `dev` script that uses `concurrently` to start both; tell me if you want that added.

Troubleshooting:
- If the Electron window shows the AI client instead of the OS, make sure the `web_ui` dev server is running on the port expected by `electron-main.js` (default `5173`).
- Check console output in both terminals for errors and share them if you want me to help debug.
