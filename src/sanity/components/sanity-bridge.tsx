import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { isSanityRuntimeConfigured } from "../lib/configured";

export async function SanityBridge() {
  if (!isSanityRuntimeConfigured()) return null;

  const [{ SanityLive }, { isEnabled }] = await Promise.all([
    import("../lib/live"),
    draftMode(),
  ]);

  return (
    <>
      <SanityLive includeDrafts={isEnabled} />
      {isEnabled ? <VisualEditing /> : null}
    </>
  );
}
