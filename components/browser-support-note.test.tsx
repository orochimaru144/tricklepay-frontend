import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BrowserSupportNote, type BrowserSupportNoteProps } from "./browser-support-note";

// Rendered with react-dom/server because the note reads the browser through a
// hook, which needs a real render pass (a plain function call has no hook
// dispatcher). No DOM is involved; an empty string means "rendered nothing".
function render(props: BrowserSupportNoteProps = {}): string {
  return renderToStaticMarkup(createElement(BrowserSupportNote, props));
}

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";
const DESKTOP_SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const FIREFOX_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0";
const EDGE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";

describe("BrowserSupportNote", () => {
  describe("for an unsupported browser", () => {
    it("renders the note on a mobile browser", () => {
      const html = render({ userAgent: IPHONE_UA });

      expect(html).toContain('role="note"');
      expect(html).toContain('aria-label="Browser and wallet compatibility information"');
      expect(html).toContain("Wallet Support");
      expect(html).toContain("Freighter extension");
    });

    it("renders the note on a desktop browser the extension doesn't run in", () => {
      expect(render({ userAgent: DESKTOP_SAFARI_UA })).toContain('role="note"');
    });

    it("renders the condensed variant when asked", () => {
      const html = render({ userAgent: IPHONE_UA, compact: true });

      expect(html).toContain('aria-label="Browser support notice"');
      expect(html).toContain("Browser support:");
    });

    it("applies the given className", () => {
      expect(render({ userAgent: IPHONE_UA, className: "mt-8" })).toContain("mt-8");
    });
  });

  describe("for a supported browser", () => {
    it.each([
      ["Chrome", CHROME_UA],
      ["Firefox", FIREFOX_UA],
      ["Edge", EDGE_UA],
    ])("renders nothing on %s", (_name, userAgent) => {
      expect(render({ userAgent })).toBe("");
    });

    it("renders nothing for the condensed variant either", () => {
      expect(render({ userAgent: CHROME_UA, compact: true })).toBe("");
    });
  });

  describe("before the browser is known", () => {
    it("renders nothing, so supported browsers never see it flash", () => {
      // A server render (and the first client render) has no user agent to
      // read, so with no override the note stays hidden.
      expect(render()).toBe("");
    });
  });
});
