import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),

  // API routes for caching
  route("api/prices", "routes/api.prices.ts"),
  route("api/balances/:address", "routes/api.balances.$address.ts"),
  route("api/cache-stats", "routes/api.cache-stats.ts"),
] satisfies RouteConfig;
