import * as esbuild from "esbuild";
import InlineCSSPlugin from "esbuild-plugin-inline-css";

esbuild
  .build({
    bundle: true,
    entryPoints: {
      app: "./index.jsx",
    },
    format: "esm",
    loader: {
      ".png": "dataurl",
      ".svg": "dataurl",
    },
    plugins: [InlineCSSPlugin()],
    outdir: "./dist",
    platform: "browser",
    // splitting: true,
    minify: true,
  })
  .then(() => {
    console.log("Build complete");
  })
  .catch(() => process.exit(1));
