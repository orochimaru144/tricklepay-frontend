import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import Loading from "./loading";

describe("Loading Route Segment", () => {
  it("renders without error", () => {
    const el = Loading();
    const htmlString = renderToStaticMarkup(el);
    expect(htmlString).toContain("Loading TricklePay");
  });

  it("exposes an accessible status role", () => {
    const el = Loading();
    const htmlString = renderToStaticMarkup(el);
    
    // The loading component should use a proper ARIA role so screen readers
    // announce it. The actual implementation uses role="status" via the
    // BrandSpinner component.
    expect(htmlString).toContain('role="status"');
  });
});
