import { describe, expect, it } from "vitest";

import { LoadingState } from "./loading-state";

describe("LoadingState", () => {
  it("renders the message passed to it", () => {
    const customLabel = "Loading custom data";
    const element = LoadingState({ variant: "stream-list", label: customLabel });
    
    // Element is a div with children: [span.sr-only, StreamListSkeleton]
    const [spanElement] = element.props.children;
    expect(spanElement.props.children).toBe(customLabel);
    expect(spanElement.props.className).toBe("sr-only");
  });

  it("exposes an accessible status", () => {
    const element = LoadingState({ variant: "stream-detail" });
    
    // The wrapper div itself acts as the status region
    expect(element.props.role).toBe("status");
    expect(element.props["aria-live"]).toBe("polite");
    expect(element.props["aria-busy"]).toBe("true");
  });
});
