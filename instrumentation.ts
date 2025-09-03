import { getObyteClient } from './services/getObyteClient';

export const runtime = 'nodejs';

export async function register() {
  console.log("Start bootstrapping...");

  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    console.error("error: Unsupported runtime");
    throw new Error("Unsupported runtime");
  }

  const client = await getObyteClient();

  client.onConnect(() => {
    console.log("Bootstrapping completed.");

    // TODO: implement loading symbols
  });
}