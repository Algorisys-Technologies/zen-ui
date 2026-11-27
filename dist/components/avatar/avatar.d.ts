import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
/**
 * Avatar — compound API built on @radix-ui/react-avatar.
 *
 *   <Avatar>
 *     <AvatarImage src="…" alt="…" />
 *     <AvatarFallback>AB</AvatarFallback>
 *   </Avatar>
 *
 * Radix's AvatarImage emits `data-loading-status="idle|loading|loaded|error"`
 * so the fallback shows automatically while the image is loading or failed.
 *
 * For grouped / stacked avatars use <AvatarGroup>.
 */
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
    size?: AvatarSize;
}
declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLSpanElement>>;
declare const AvatarImage: React.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarImageProps & React.RefAttributes<HTMLImageElement>, "ref"> & React.RefAttributes<HTMLImageElement>>;
declare const AvatarFallback: React.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarFallbackProps & React.RefAttributes<HTMLSpanElement>, "ref"> & React.RefAttributes<HTMLSpanElement>>;
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Maximum number of avatars to show. Excess collapses to "+N". */
    max?: number;
    /** Spacing between stacked avatars (negative left margin on children). */
    spacing?: "tight" | "default" | "loose";
    size?: AvatarSize;
}
declare const AvatarGroup: React.ForwardRefExoticComponent<AvatarGroupProps & React.RefAttributes<HTMLDivElement>>;
export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };
//# sourceMappingURL=avatar.d.ts.map