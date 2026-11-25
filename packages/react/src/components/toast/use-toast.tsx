import * as React from "react";
import type { ToastProps } from "./toast";

/**
 * useToast — imperative toast API on top of the compound Toast primitives.
 *
 *   const { toast } = useToast();
 *   toast({ title: "Saved", description: "Profile updated." });
 *   toast({ variant: "destructive", title: "Couldn't save", description: err.message });
 *
 * Pair with <Toaster /> from ./toaster.tsx mounted once near the root.
 *
 * Subscribe pattern (module-scoped store) — adapted from the shadcn
 * reference impl. Multiple useToast() consumers stay in sync via the
 * shared listener list.
 */

export interface ToastDescriptor {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: ToastProps["variant"];
  /** Time before auto-dismiss, ms. Default 5_000. Pass `Infinity` for sticky. */
  duration?: number;
  /** Work in progress — `toast.loading()`: a spinner beside the title. */
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Action =
  | { type: "ADD"; toast: ToastDescriptor }
  | { type: "UPDATE"; toast: Partial<ToastDescriptor> & { id: string } }
  | { type: "DISMISS"; id?: string }
  | { type: "REMOVE"; id?: string };

interface State { toasts: ToastDescriptor[] }

const MAX_TOASTS = 5;
const REMOVE_DELAY_MS = 1_000;

let state: State = { toasts: [] };
const listeners: Array<(s: State) => void> = [];

const removeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function setState(next: State) {
  state = next;
  listeners.forEach((l) => l(state));
}

function queueRemove(id: string) {
  if (removeTimeouts.has(id)) return;
  const t = setTimeout(() => {
    removeTimeouts.delete(id);
    setState({
      ...state,
      toasts: state.toasts.filter((t) => t.id !== id),
    });
  }, REMOVE_DELAY_MS);
  removeTimeouts.set(id, t);
}

function reducer(action: Action) {
  switch (action.type) {
    case "ADD":
      setState({
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, MAX_TOASTS),
      });
      break;
    case "UPDATE":
      setState({
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      });
      break;
    case "DISMISS": {
      const { id } = action;
      if (id) {
        queueRemove(id);
      } else {
        state.toasts.forEach((t) => queueRemove(t.id));
      }
      setState({
        ...state,
        toasts: state.toasts.map((t) =>
          id === undefined || t.id === id ? { ...t, open: false } : t,
        ),
      });
      break;
    }
    case "REMOVE":
      if (action.id === undefined) {
        setState({ ...state, toasts: [] });
      } else {
        setState({
          ...state,
          toasts: state.toasts.filter((t) => t.id !== action.id),
        });
      }
      break;
  }
}

let counter = 0;
const nextId = () => {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return String(counter);
};

export interface ToastInput {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: ToastProps["variant"];
  duration?: number;
  /** Work in progress: a spinner beside the title. */
  loading?: boolean;
}

/**
 * Per-call options for the Solid-style calls — the parts of solid-toast's
 * options that carry across. Reusing an `id` replaces that toast, which is
 * how a "Saving…" toast becomes "Saved" in place.
 */
export interface ToastOptions {
  id?: string;
  /** ms. Default 5_000; `toast.loading` defaults to sticky. */
  duration?: number;
}

/** What `toast.promise` shows for each stage; a function gets the value or error. */
export interface ToastPromiseMessages<T> {
  loading: React.ReactNode;
  success: React.ReactNode | ((value: T) => React.ReactNode);
  error: React.ReactNode | ((error: unknown) => React.ReactNode);
}

/** Add a toast, or — with an id that is already showing — replace it in place. */
function show(input: ToastInput, id: string = nextId()) {
  const update = (next: ToastInput) =>
    reducer({ type: "UPDATE", toast: { ...next, id } });
  const dismiss = () => reducer({ type: "DISMISS", id });

  if (state.toasts.some((t) => t.id === id)) {
    // A toast dismissed a moment ago is still waiting to be removed; reusing
    // its id brings it back, so the pending removal must not take it.
    const pending = removeTimeouts.get(id);
    if (pending) {
      clearTimeout(pending);
      removeTimeouts.delete(id);
    }
    // Replaced, not merged: a "Saved" that inherited the "Saving…" spinner or
    // its sticky duration would never go away.
    reducer({
      type: "UPDATE",
      toast: { title: undefined, description: undefined, action: undefined, variant: undefined, duration: undefined, loading: undefined, ...input, id, open: true },
    });
  } else {
    reducer({
      type: "ADD",
      toast: {
        ...input,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss();
        },
      },
    });
  }
  return { id, update, dismiss };
}

/** A message rather than a descriptor — the Solid call, `toast("Saved")`. */
const isMessage = (input: unknown): input is React.ReactNode =>
  typeof input !== "object" || input === null || React.isValidElement(input);

function message(text: React.ReactNode, extra: ToastInput, options: ToastOptions = {}): string {
  return show({ title: text, duration: options.duration, ...extra }, options.id).id;
}

/**
 * Show a toast. Two call shapes, one store:
 *
 *   toast({ title: "Saved", description: "Profile updated." })   // → { id, update, dismiss }
 *   toast("Saved")                                               // → id, as in the Solid binding
 *   toast.success("Profile updated");  toast.error("Couldn't save");
 *   const id = toast.loading("Saving…");  …  toast.success("Saved", { id });
 *   toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Couldn't save" });
 *   toast.dismiss(id);
 *
 * The second shape is the Solid binding's (solid-toast's), so a call written
 * for one binding works in the other.
 */
function toastFn(input: ToastInput): ReturnType<typeof show>;
function toastFn(text: React.ReactNode, options?: ToastOptions): string;
function toastFn(input: ToastInput | React.ReactNode, options?: ToastOptions) {
  if (isMessage(input)) return message(input, {}, options);
  return show(input as ToastInput);
}

export const toast = Object.assign(toastFn, {
  success: (text: React.ReactNode, options?: ToastOptions) => message(text, { variant: "success" }, options),
  error: (text: React.ReactNode, options?: ToastOptions) => message(text, { variant: "destructive" }, options),
  /** Sticky until replaced (pass its id to success/error) or dismissed — solid-toast's default. */
  loading: (text: React.ReactNode, options?: ToastOptions) =>
    message(text, { loading: true, duration: options?.duration ?? Infinity }, options),
  /** Close one toast, or every toast with no id. It animates out. */
  dismiss: (id?: string) => reducer({ type: "DISMISS", id }),
  /** Remove at once, with no exit animation. */
  remove: (id?: string) => reducer({ type: "REMOVE", id }),
  /** A loading toast that becomes success or error when the promise settles. Returns the promise. */
  promise: <T,>(promise: Promise<T>, messages: ToastPromiseMessages<T>, options?: ToastOptions): Promise<T> => {
    const id = toast.loading(messages.loading, options);
    promise.then(
      (value) =>
        toast.success(typeof messages.success === "function" ? messages.success(value) : messages.success, { id, duration: options?.duration }),
      (error) =>
        toast.error(typeof messages.error === "function" ? messages.error(error) : messages.error, { id, duration: options?.duration }),
    );
    return promise;
  },
});

export function useToast() {
  const [snapshot, setSnapshot] = React.useState<State>(state);

  React.useEffect(() => {
    listeners.push(setSnapshot);
    return () => {
      const idx = listeners.indexOf(setSnapshot);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  return {
    toasts: snapshot.toasts,
    toast,
    dismiss: (id?: string) => reducer({ type: "DISMISS", id }),
  };
}
