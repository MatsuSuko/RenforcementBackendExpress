// ─── Configuration de l'environnement ─────────────────────────────────────────
//
// Pour utiliser ngrok :
//   1. Lance ngrok dans un terminal : npx ngrok http 3000
//   2. Copie l'URL générée (ex: https://abc123.ngrok-free.app)
//   3. Colle-la dans NGROK_URL ci-dessous
//   4. Recharge l'app (r dans le terminal Expo)
//
// Pour revenir en local : remets NGROK_URL à null

const NGROK_URL: string | null = null;
// const NGROK_URL = 'https://abc123.ngrok-free.app';

// IP de ton Mac sur le réseau local (affiché dans le terminal Expo)
export const MAC_IP = '10.18.72.59';

export { NGROK_URL };
