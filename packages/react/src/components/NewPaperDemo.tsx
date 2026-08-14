import {
  Paper,
  PaperHeader,
  PaperTitle,
  PaperDescription,
  PaperContent,
  PaperFooter,
} from "./paper/paper";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./dialog/dialog";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const BODY = `Every project starts with the same three questions, and we keep
answering them in different places. This is an attempt to answer them once, in
one document, that everyone can read end to end without opening four tabs.`;

const NewPaperDemo = () => (
  <div className="demo-page">
    <h1>Paper</h1>
    <p className="lede">
      A document surface — a sheet you read, rather than a box you put things
      in. Card is the generic surface primitive; reach for Paper when the
      content is prose and the reading is the point. It brings the two things
      Card cannot express: a reading measure, and document typography.
    </p>

    <section className="demo-section">
      <h2>1. A sheet on a desk</h2>
      <CodeExample
        title="Defaults: prose measure, raised, document padding"
        description="Paper caps itself at a readable line length and centres, because a page lies on a desk rather than filling it. Put it on a bg-zen-muted ground to get the contact the shadow implies — with the sheet and the ground both painted background, the elevation has nothing to sit on."
        code={`<Paper>
  <PaperHeader>
    <PaperTitle>Kickoff notes</PaperTitle>
    <PaperDescription>Rajesh · 14 August</PaperDescription>
  </PaperHeader>
  <PaperContent>
    <p>Long-form content, capped at a readable line length.</p>
  </PaperContent>
  <PaperFooter>
    <Button size="sm">Reply</Button>
  </PaperFooter>
</Paper>`}
      >
        <div className="zen-w-full zen-bg-zen-muted zen-p-8">
          <Paper>
            <PaperHeader>
              <PaperTitle>Kickoff notes</PaperTitle>
              <PaperDescription>Rajesh · 14 August</PaperDescription>
            </PaperHeader>
            <PaperContent>
              <p className="zen-m-0">{BODY}</p>
            </PaperContent>
            <PaperFooter>
              <Button size="sm">Reply</Button>
              <Button size="sm" variant="ghost">
                Archive
              </Button>
            </PaperFooter>
          </Paper>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Measure is the point</h2>
      <CodeExample
        title="`measure` caps the sheet in ch, not px"
        description="The cap is a line length, not a box: 65ch stays about 65 characters whatever the type scale does, which px cannot promise. This is the one property the paper THEME cannot give you — --zen-* reaches colour, radius, shadow and type, but the utility layer has no width or spacing tokens, so a max-width is a literal no override can reach."
        code={`<Paper measure="prose">…</Paper>   {/* 65ch — the default */}
<Paper measure="wide">…</Paper>    {/* 80ch */}
<Paper measure="full">…</Paper>    {/* fills its container */}`}
      >
        <div className="zen-w-full zen-flex zen-flex-col zen-gap-4 zen-bg-zen-muted zen-p-8">
          <Paper measure="prose" padding="sm">
            <PaperContent>
              <p className="zen-m-0">prose — 65ch. {BODY}</p>
            </PaperContent>
          </Paper>
          <Paper measure="wide" padding="sm">
            <PaperContent>
              <p className="zen-m-0">wide — 80ch. {BODY}</p>
            </PaperContent>
          </Paper>
          <Paper measure="full" padding="sm">
            <PaperContent>
              <p className="zen-m-0">full — fills the container. {BODY}</p>
            </PaperContent>
          </Paper>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Elevation</h2>
      <CodeExample
        title="`raised` and `lifted` have no border — the shadow is the edge"
        description="A hairline plus a shadow reads as a bordered card, which is the look this is trying not to be. `flat` is the opposite trade: a border and no shadow, for when sheets sit adjacent and a shadow between them would read as a gap."
        code={`<Paper elevation="flat">…</Paper>
<Paper elevation="raised">…</Paper>   {/* the default */}
<Paper elevation="lifted">…</Paper>`}
      >
        <div className="zen-w-full zen-grid zen-gap-6 zen-bg-zen-muted zen-p-8 sm:zen-grid-cols-3">
          <Paper elevation="flat" measure="full" padding="sm">
            <PaperContent>flat</PaperContent>
          </Paper>
          <Paper elevation="raised" measure="full" padding="sm">
            <PaperContent>raised</PaperContent>
          </Paper>
          <Paper elevation="lifted" measure="full" padding="sm">
            <PaperContent>lifted</PaperContent>
          </Paper>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Padding is document margins</h2>
      <CodeExample
        title="Larger than Card's throughout — that is the point"
        code={`<Paper padding="none">…</Paper>
<Paper padding="sm">…</Paper>
<Paper padding="md">…</Paper>   {/* the default */}
<Paper padding="lg">…</Paper>`}
      >
        <div className="zen-w-full zen-flex zen-flex-col zen-gap-4 zen-bg-zen-muted zen-p-8">
          <Paper padding="sm" measure="full">
            <PaperContent>sm</PaperContent>
          </Paper>
          <Paper padding="md" measure="full">
            <PaperContent>md — the default</PaperContent>
          </Paper>
          <Paper padding="lg" measure="full">
            <PaperContent>lg</PaperContent>
          </Paper>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. A pile, not a sheet</h2>
      <CodeExample
        title="`stack` draws 1 or 2 sheet edges behind this one"
        description="The affordance a column of separate Papers cannot express: this is a thread, and there are more. Decorative by construction — the edges are box-shadows, so nothing enters the DOM or the accessibility tree and a reader is never told the pile holds three documents when you rendered one. It composes with elevation: both live in one box-shadow list, because elevation already owns that property and a second utility would replace it rather than merge."
        code={`<Paper stack={1}>…</Paper>
<Paper stack={2}>…</Paper>

{/* composes with elevation */}
<Paper stack={2} elevation="lifted">…</Paper>`}
      >
        <div className="zen-w-full zen-grid zen-gap-8 zen-bg-zen-muted zen-p-8 sm:zen-grid-cols-3">
          <Paper measure="full" padding="sm">
            <PaperContent>no stack</PaperContent>
          </Paper>
          <Paper measure="full" padding="sm" stack={1}>
            <PaperContent>stack={"{1}"}</PaperContent>
          </Paper>
          <Paper measure="full" padding="sm" stack={2} elevation="lifted">
            <PaperContent>stack={"{2}"} + lifted</PaperContent>
          </Paper>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. A dialog that is a document</h2>
      <CodeExample
        title='DialogContent variant="paper"'
        description="Not a restyle: a document is top-anchored. Centring a long sheet vertically and scrolling it inside 85vh puts the first line somewhere different on every screen. Paper mode drops the vertical centring, scrolls the viewport rather than the panel, and widens the cap. Pass nothing and Dialog is byte-identical to before."
        code={`<DialogContent variant="paper">
  <DialogHeader>
    <DialogTitle>Kickoff notes</DialogTitle>
    <DialogDescription>Rajesh · 14 August</DialogDescription>
  </DialogHeader>
  …
</DialogContent>`}
      >
        <div className="zen-flex zen-flex-wrap zen-gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open a paper dialog</Button>
            </DialogTrigger>
            <DialogContent variant="paper">
              <DialogHeader>
                <DialogTitle>Kickoff notes</DialogTitle>
                <DialogDescription>Rajesh · 14 August</DialogDescription>
              </DialogHeader>
              {/* Deliberately taller than the viewport: a paper dialog that fits
                on screen never exercises the scroll container, which is exactly
                how the missing one went unnoticed. */}
              <div className="zen-text-base zen-leading-relaxed">
                {Array.from({ length: 8 }).map((_, i) => (
                  <p key={i}>{BODY}</p>
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Close</Button>
                </DialogClose>
                <Button>Reply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">…and the default, unchanged</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Update your profile information.
                </DialogDescription>
              </DialogHeader>
              <p className="zen-text-sm">
                Centred, capped at max-w-lg, scrolls inside itself.
              </p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>7. Pairs with the paper theme, but does not need it</h2>
      <CodeExample
        title='data-theme="paper" on any ancestor'
        description="Paper sets its own leading and measure, so it reads the same under every theme. The paper THEME supplies what a component cannot reach globally: warm ground and sheet, cut corners, a contact shadow, and looser body leading. The two compound — that is the intended pairing, not a requirement."
        code={`<div data-theme="paper">
  <Paper>…</Paper>
</div>`}
      >
        <div className="zen-w-full zen-grid zen-gap-6 sm:zen-grid-cols-2">
          <div className="zen-bg-zen-muted zen-p-6">
            <Paper measure="full" padding="sm">
              <PaperHeader>
                <PaperTitle>Default theme</PaperTitle>
              </PaperHeader>
              <PaperContent>
                <p className="zen-m-0">{BODY}</p>
              </PaperContent>
            </Paper>
          </div>
          <div data-theme="paper" className="zen-bg-zen-muted zen-p-6">
            <Paper measure="full" padding="sm">
              <PaperHeader>
                <PaperTitle>Paper theme</PaperTitle>
              </PaperHeader>
              <PaperContent>
                <p className="zen-m-0">{BODY}</p>
              </PaperContent>
            </Paper>
          </div>
        </div>
      </CodeExample>
    </section>
  </div>
);

export default NewPaperDemo;
