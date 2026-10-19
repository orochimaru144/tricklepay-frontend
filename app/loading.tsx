import type { JSX } from "react";

import { LoadingState } from "@/components/loading-state";

// Next.js renders this automatically while a route segment is loading (e.g.
// a slow initial chunk load), before the page's own data-shaped loading state.
export default function Loading(): JSX.Element {
  return (
    <main id="main-content">
      <LoadingState variant="spinner" />
    </main>
  );
}
