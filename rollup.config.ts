import typescript from "@rollup/plugin-typescript";

export default ["common", "ali-trace"].map((name) => ({
  input: `src/${name}/index.ts`,
  include: [`src/${name}/**/*`],
  output: {
    dir: `output/${name}`,
    format: "umd",
    name: `@blastz/opentelemetry-helper/${name}`,
  },
  plugins: [
    typescript({
      target: "es5",
      module: "esnext",
      outDir: `output/${name}`,
      include: [`src/${name}/**/*`],
      declaration: true,
      sourceMap: false,
    }),
  ],
}));
