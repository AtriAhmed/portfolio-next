import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  { ignores: ["portfolio-mern-front/**", "portfolio-mern-backend/**", ".next/**", "next-env.d.ts"] },
];

export default config;
