import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import envCompatible from "vite-plugin-env-compatible";

const env = dotenv.config({ path: ".env.local" }).parsed || {};
const FACTORY_CONTRACT_ADDRESS = "0x3132b5E0B22c52474fE6b5505195c2085Db257F6";

export default defineConfig({
  plugins: [react(), envCompatible(env)],
  resolve: {
    alias: {
      util: "util",
    },
  },
  define: {
    "import.meta.env.FACTORY_CONTRACT_ADDRESS": JSON.stringify(
      FACTORY_CONTRACT_ADDRESS
    ),
  },
});
