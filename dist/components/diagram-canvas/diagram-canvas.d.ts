import * as React from "react";
/**
 * DiagramCanvas — an embedded diagram editor, for a system-design answer.
 *
 *   <DiagramCanvas value={xml} onChange={setXml} onSave={persist} />
 *
 * It embeds diagrams.net (draw.io) in an iframe and speaks its `postMessage`
 * protocol. There is no npm diagram package here and that is the point: the
 * editor is a whole application — shape libraries, routing, a format — and
 * vendoring one would be the largest dependency in zen-ui by an order of
 * magnitude, to serve one screen in one product.
 *
 * The trade is explicit, because it is a real one. An embed means the editor is
 * a third party's, loaded from their origin by default, and unavailable offline.
 * `src` is a prop so a consumer can point it at a self-hosted build, which is
 * the answer for an exam that must not depend on someone else's uptime.
 *
 * The format is draw.io XML, in and out. `onChange` fires on every edit;
 * `onSave` fires when the user presses save inside the editor, which is the
 * point worth persisting.
 */
/**
 * Which editor is embedded.
 *
 * - `"drawio"` — diagrams.net. Third-party, hosted, draw.io XML.
 * - `"yappydraw"` — YappyDraw, Algorisys's own editor. Client-side, free, and
 *   self-hostable, which is what makes it the better answer for an exam that
 *   must not depend on someone else's uptime. Its document format is JSON.
 *
 * They speak different protocols, so this is not merely a URL swap — see the
 * two branches in the message handler.
 */
export type DiagramProvider = "drawio" | "yappydraw";
/** The public diagrams.net embed. Point `src` at your own build to self-host. */
export declare const DEFAULT_DIAGRAM_EMBED_URL = "https://embed.diagrams.net/?embed=1&proto=json&spin=1&ui=min&libraries=1";
/** The hosted YappyDraw. Point `src` at your own build to self-host. */
export declare const DEFAULT_YAPPYDRAW_EMBED_URL = "https://www.yappydraw.com/";
/**
 * YappyDraw refuses cross-origin control unless its OPERATOR allowlists the
 * framing origin at deploy time (`VITE_EMBED_ALLOWED_ORIGINS`, or
 * `window.YAPPY_EMBED_ALLOWED_ORIGINS` in its own index.html). A framing page
 * cannot opt itself in, which is the right way round — but it does mean a
 * correct integration looks broken until the Yappy deployment is configured.
 * Hence `onError`: silence there is indistinguishable from a bug.
 */
export interface DiagramCanvasProps {
    /** Which editor to embed. Default `"drawio"`. */
    provider?: DiagramProvider;
    /** draw.io XML, or a YappyDraw JSON document. Empty starts a blank diagram. */
    value?: string;
    /** Every edit. */
    onChange?: (xml: string) => void;
    /** The user pressed save inside the editor — persist this. */
    onSave?: (xml: string) => void;
    /** The editor is ready and has been given the initial value. */
    onReady?: () => void;
    /** Editor origin. Replace to self-host; the origin is also what messages are checked against. */
    src?: string;
    /** The bridge failed — most often an origin the Yappy deployment has not allowlisted. */
    onError?: (message: string) => void;
    /**
     * The frame's `sandbox`. Overriding it is an explicit security decision —
     * read the note beside the default before narrowing it, because dropping
     * `allow-same-origin` stops most editors loading their own assets.
     */
    sandbox?: string;
    /** CSS height. Default `"32rem"`. */
    height?: string;
    /** Accessible name for the frame. */
    title?: string;
    className?: string;
}
export declare const DiagramCanvas: ({ provider, value, onChange, onSave, onReady, onError, src, sandbox, height, title, className, }: DiagramCanvasProps) => React.JSX.Element;
export interface ArchitectureDrawProps extends DiagramCanvasProps {
    /** Shown above the canvas. */
    label?: React.ReactNode;
    /** Rendered beside the label — a save button, a reset. */
    actions?: React.ReactNode;
}
/**
 * ArchitectureDraw — DiagramCanvas with a heading row.
 *
 * The composition an assessment actually renders: a labelled canvas with its
 * own actions, rather than a bare frame the caller has to wrap every time.
 */
export declare const ArchitectureDraw: ({ label, actions, className, ...canvas }: ArchitectureDrawProps) => React.JSX.Element;
//# sourceMappingURL=diagram-canvas.d.ts.map