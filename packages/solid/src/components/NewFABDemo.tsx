import { createSignal, For, Show } from "solid-js";
import { FAB } from "./fab/fab";
import { Button } from "./button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu/dropdown-menu";
import { Icon } from "./icon/icon";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewFABDemo = () => {
  const [showFixed, setShowFixed] = createSignal(false);
  const [last, setLast] = createSignal<string | null>(null);

  return (
    <DemoPage
      title="FAB"
      description={
        <>
          Fixed-position floating action button. Wraps <code>Button</code> with
          positioning and elevation — a circle in a corner of the viewport, for
          the one action a screen is really about.
        </>
      }
    >
      <DemoSection
        title="1. Inline preview"
        codeTitle="Toggle to mount the fixed-position FABs"
        codeDescription="A FAB is position: fixed, so it floats over the whole page rather than sitting in this example box. They are behind a toggle here to keep the docs page readable — turn it on and look at the corners of the viewport, not at this card."
        code={`<FAB aria-label="Add" iconLeft={<Icon name="plus" />} onClick={add} />
<FAB position="bottom-left" color="error"
     aria-label="Delete" iconLeft={<Icon name="trash" />} />`}
      >
        <div class="zen-flex zen-flex-col zen-gap-3">
          <div class="zen-flex zen-items-center zen-gap-3">
            <Button size="sm" onClick={() => setShowFixed((v) => !v)}>
              {showFixed() ? "Hide fixed FABs" : "Show fixed FABs"}
            </Button>
            <Show when={last()}>
              <span class="zen-text-sm zen-text-zen-muted-fg">clicked: {last()}</span>
            </Show>
          </div>
          <Show when={showFixed()}>
            <>
              <FAB
                position="bottom-right"
                color="primary"
                aria-label="Add"
                iconLeft={<Icon name="plus" size={20} />}
                onClick={() => setLast("primary / bottom-right")}
              />
              <FAB
                position="bottom-left"
                color="error"
                aria-label="Delete"
                iconLeft={<Icon name="trash" size={20} />}
                onClick={() => setLast("error / bottom-left")}
              />
            </>
          </Show>
        </div>
      </DemoSection>

      <DemoSection
        title="2. Position"
        codeTitle="Four corners"
        codeDescription="bottom-right is the default and the one to reach for — it is where a thumb rests on a phone. bottom-left suits right-to-left layouts or a screen whose right corner is already spoken for; the top positions are unusual and mostly exist for full-bleed layouts with no header."
        code={`<FAB position="bottom-right" />   // default
<FAB position="bottom-left" />
<FAB position="top-right" />
<FAB position="top-left" />`}
      >
        <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
          Use the toggle in section 1 to see two of these mounted at once, in
          opposite corners.
        </p>
      </DemoSection>

      <DemoSection
        title="3. Size and colour"
        codeTitle="Three sizes, and Button's colour scale"
        codeDescription="lg (56px) is the default and matches the platform conventions on both iOS and Android. md suits dense desktop tools; xl is for a genuinely primary action on a touch-first screen. Colour comes straight from Button, so a FAB cannot drift away from the rest of the buttons in your app."
        code={`<FAB size="md" />   // 48px
<FAB size="lg" />   // 56px — default
<FAB size="xl" />   // 64px

<FAB color="primary" />  // default
<FAB color="error" />`}
      >
        <div class="zen-flex zen-items-end zen-gap-6">
          <For each={["md", "lg", "xl"] as const}>
            {(size) => (
              <div class="zen-flex zen-flex-col zen-items-center zen-gap-1">
                {/* `position` omitted so these render inline, side by side, for
                    comparison — a fixed one would leave the card entirely. */}
                <FAB
                  size={size}
                  aria-label={`Size ${size}`}
                  iconLeft={<Icon name="plus" size={20} />}
                />
                <span class="zen-text-xs zen-text-zen-muted-fg">{size}</span>
              </div>
            )}
          </For>
        </div>
      </DemoSection>

      <DemoSection
        title="4. Speed dial"
        codeTitle="Compose with DropdownMenu rather than growing a prop"
        codeDescription="A FAB that opens a menu of actions is a DropdownMenu whose trigger happens to be a FAB. There is no `actions` prop, deliberately — the menu already exists, already handles keyboard and dismissal, and a second implementation inside FAB would be one more thing to keep in step."
        code={`<DropdownMenu>
  <DropdownMenuTrigger>
    <FAB aria-label="Actions" iconLeft={<Icon name="plus" />} />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>New document</DropdownMenuItem>
    <DropdownMenuItem>Upload</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger>
            <FAB aria-label="Actions" iconLeft={<Icon name="plus" size={20} />} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setLast("New document")}>
              New document
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLast("Upload")}>Upload</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLast("Invite people")}>
              Invite people
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoSection>
    </DemoPage>
  );
};

export default NewFABDemo;
