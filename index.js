#!/usr/bin/env node

/**
 * x402 Joke Client
 *
 * Pays for a joke using USDC on Stellar testnet via the x402 payment protocol.
 * The server uses an OpenZeppelin Relayer-based facilitator to settle payments on-chain.
 *
 * Flow:
 *   1. Request GET /joke  →  server returns 402 + payment requirements
 *   2. Client signs a Soroban authorization entry (no XLM needed — fees sponsored)
 *   3. Client retries with X-PAYMENT header containing the signed payload
 *   4. Facilitator verifies + settles the USDC transfer on Stellar
 *   5. Server returns 200 + the joke
 */

import 'dotenv/config';
import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { ExactStellarScheme, createEd25519Signer } from '@x402/stellar';

async function main() {
  // 1. Load secret key
  const secretKey = process.env.STELLAR_SECRET_KEY;
  const apiUrl = process.env.FACTS_API_URL;

  // 2. Build signer from the secret key
  let signer = createEd25519Signer(secretKey, 'stellar:testnet');

  // 3. Register the Stellar exact-payment scheme with the x402 client
  const client = new x402Client();
  const scheme = new ExactStellarScheme(signer);
  client.register('stellar:testnet', new ExactStellarScheme(signer));

//console.log(scheme.signer.signTransaction.toString());

  // 4. Wrap fetch so it automatically handles 402 → sign → retry
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);

  let response = await fetchWithPayment(apiUrl, { method: 'GET' });
  
  const body = await response.json();

  console.log(body);    
}

main();/*.catch((err) => {
  console.error('Fatal:', err?.message ?? err);
  process.exit(1);
});*/

/*
main().catch((err) => {
  console.error('Fatal:', err?.message ?? err);
  process.exit(1);
});
*/