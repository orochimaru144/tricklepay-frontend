import type { JSX } from "react";

import { BrandSpinner } from "@/components/brand-spinner";
import { StreamDetailSkeleton, StreamListSkeleton } from "@/components/skeleton";

type LoadingStateProps =
  | { variant: "stream-list"; count?: number; label?: string }
  | { variant: "stream-detail"; label?: string }
  | { variant: "spinner"; label?: string };

const DEFAULT_LABELS: Record<LoadingStateProps["variant"], string> = {
  "stream-list": "Loading streams",
  "stream-detail": "Loading stream details",
  spinner: "Loading TricklePay",
};

/**
 * The single way a view renders "data is loading". Every variant is announced
 * once to screen readers through a polite status region with a text label; the
 * visuals themselves (content-shaped skeletons, or the brand spinner when
 * there is no layout to mirror) are decorative.
 *
 * @param variant - "stream-list" and "stream-detail" mirror the layout that
 *   will replace them; "spinner" is for loads with no known shape.
 * @param count - Number of cards for "stream-list". Defaults to 2.
 * @param label - Screen reader text. Defaults per variant.
 */
export function LoadingState(props: LoadingStateProps): JSX.Element {
  const label = props.label ?? DEFAULT_LABELS[props.variant];

  // BrandSpinner already renders its own status region and label.
  if (props.variant === "spinner") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <BrandSpinner label={label} size="lg" />
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {props.variant === "stream-list" ? (
        <StreamListSkeleton count={props.count ?? 2} />
      ) : (
        <StreamDetailSkeleton />
      )}
    </div>
  );
}
