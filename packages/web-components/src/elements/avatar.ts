import {
  Avatar, AvatarImage, AvatarFallback, AvatarGroup,
  type AvatarProps, type AvatarImageProps, type AvatarGroupProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

defineZenElement<AvatarProps>({ tag: "zen-avatar", factory: Avatar, attrs: { size: "string" } });

// <zen-avatar-image src="…" alt="…"> — the <img> that fills an avatar; hides
// itself on load error so the fallback shows through.
defineZenElement<AvatarImageProps>({
  tag: "zen-avatar-image",
  factory: AvatarImage,
  attrs: { src: "string", alt: "string" },
});

defineZenElement({ tag: "zen-avatar-fallback", factory: AvatarFallback });

defineZenElement<AvatarGroupProps>({
  tag: "zen-avatar-group",
  factory: AvatarGroup,
  attrs: { max: "number", spacing: "string", size: "string" },
});
