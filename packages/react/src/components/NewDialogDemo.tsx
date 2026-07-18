import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./dialog/alert-dialog";
import { Button } from "./button/button";
import { Input } from "./form/input/input";
import { CodeExample } from "./demo-helpers";

const NewDialogDemo: React.FC = () => {
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState<string | null>(null);

  return (
    <div className="demo-page">
      <h1>Dialog + AlertDialog (new — Radix-backed)</h1>
      <p className="lede">
        Two related primitives. <code>Dialog</code> for generic modal
        content (forms, info, settings). <code>AlertDialog</code> for
        irreversible / destructive confirmations — click-outside doesn't
        dismiss; the user must answer.
      </p>

      <section className="demo-section">
        <h2>1. Basic Dialog</h2>
        <CodeExample
          title="Compound API + close button auto-rendered"
          code={`<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
      <DialogDescription>Update your profile.</DialogDescription>
    </DialogHeader>
    {/* body */}
    <DialogFooter>
      <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Update your profile information.
                </DialogDescription>
              </DialogHeader>
              <p style={{ fontSize: "0.875rem" }}>
                Body content lives here. Esc, click-outside, and the X
                button all dismiss.
              </p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost" color="neutral">Cancel</Button>
                </DialogClose>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Dialog with form</h2>
        <CodeExample
          title="Body can host any content — including a controlled form"
          code={`const [name, setName] = useState("");

<Dialog>
  <DialogTrigger asChild><Button variant="outline">Edit name</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit name</DialogTitle>
    </DialogHeader>
    <label className="flex flex-col gap-1">
      <span>Name</span>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
    </label>
    <DialogFooter>
      <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
      <DialogClose asChild><Button onClick={save}>Save</Button></DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit name (was: {name || "—"})</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit name</DialogTitle>
                <DialogDescription>
                  Save closes the dialog automatically via DialogClose
                  wrapping the action button.
                </DialogDescription>
              </DialogHeader>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>Name</span>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost" color="neutral">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Save</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. AlertDialog — destructive confirm</h2>
        <CodeExample
          title="Blocks click-outside dismissal; user must answer"
          description="role='alertdialog' announces immediately. Esc still closes for keyboard a11y."
          code={`<AlertDialog>
  <AlertDialogTrigger asChild><Button color="error">Delete account</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete account?</AlertDialogTitle>
      <AlertDialogDescription>
        Removes all data permanently. This cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel asChild><Button variant="ghost">Cancel</Button></AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button color="error" onClick={deleteAccount}>Delete</Button>
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button color="error">Delete account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Removes all data permanently. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant="ghost" color="neutral">Cancel</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button color="error" onClick={() => setConfirmed("deleted")}>
                      Delete
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {confirmed ? (
              <span style={{ fontSize: "0.8125rem", color: "var(--zen-color-success)" }}>
                Action confirmed: {confirmed}
              </span>
            ) : null}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Controlled dialog (open state lifted)</h2>
        <CodeExample
          title="open + onOpenChange — useful for navigation-driven modals"
          code={`const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>...</DialogContent>
</Dialog>

<Button onClick={() => setOpen(true)}>Open from anywhere</Button>`}
        >
          <ControlledDialogExample />
        </CodeExample>
      </section>
    </div>
  );
};

const ControlledDialogExample = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open from outside</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled</DialogTitle>
            <DialogDescription>
              Open state lives in the parent. setOpen(false) or the X /
              Esc / click-outside all close.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDialogDemo;
