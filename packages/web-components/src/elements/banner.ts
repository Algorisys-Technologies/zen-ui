import {
  Banner, BannerIcon, BannerContent, BannerActions,
  type BannerProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-banner color="warning" sticky>…</zen-banner>
// `sticky` defaults to false, so it is a plain boolean attribute.
defineZenElement<BannerProps>({
  tag: "zen-banner",
  factory: Banner,
  attrs: { color: "string", sticky: "boolean" },
});

defineZenElement({ tag: "zen-banner-icon", factory: BannerIcon });
defineZenElement({ tag: "zen-banner-content", factory: BannerContent });
defineZenElement({ tag: "zen-banner-actions", factory: BannerActions });
