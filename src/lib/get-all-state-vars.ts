import { Client } from "obyte";
import "server-only";

const MAX_STATE_VARS_LOAD_ITERATIONS = 100 as const; // Safety limit

// TODO: WARNING: You should have more than 1 state vars

const getAllStateVars = async (client: Client, address: string) => {
  let allStateVars = {};
  let iteration = 0;
  let lastKey = "";

  try {
    while (true) {
      if (iteration++ > MAX_STATE_VARS_LOAD_ITERATIONS) {
        throw new Error(`Reached maximum iterations (${MAX_STATE_VARS_LOAD_ITERATIONS}) when fetching AA state vars`);
      }

      const chunkData = await client.api.getAaStateVars({
        address: address,
        // @ts-expect-error no error
        var_prefix_from: lastKey,
      });

      const keys = Object.keys(chunkData);

      if (keys.length > 1) {
        allStateVars = { ...allStateVars, ...chunkData };
        lastKey = keys[keys.length - 1];
      } else {
        break;
      }
    }
  } catch (e) {
    console.error("getAllStateVars(error) fetching AA state vars:", e);
  }

  return allStateVars;
};

export default getAllStateVars;
