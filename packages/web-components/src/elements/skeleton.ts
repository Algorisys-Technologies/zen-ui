import { Skeleton, type SkeletonProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// A pulsing placeholder box. Sized by class/style from the caller.
defineZenElement<SkeletonProps>({ tag: "zen-skeleton", factory: Skeleton });
