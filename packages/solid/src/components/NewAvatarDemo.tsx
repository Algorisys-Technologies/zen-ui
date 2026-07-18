import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from "./avatar/avatar";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewAvatarDemo = () => (
  <DemoPage
    title="Avatar"
    description="Image with graceful fallback. Built on Kobalte Image primitive."
  >
    <DemoSection
      title="Sizes"
      codeTitle="xs · sm · md · lg · xl"
      code={`<Avatar size="xs"><AvatarFallback>AB</AvatarFallback></Avatar>
<Avatar size="sm"><AvatarFallback>AB</AvatarFallback></Avatar>
<Avatar size="md"><AvatarFallback>AB</AvatarFallback></Avatar>
<Avatar size="lg"><AvatarFallback>AB</AvatarFallback></Avatar>
<Avatar size="xl"><AvatarFallback>AB</AvatarFallback></Avatar>`}
    >
      <Avatar size="xs"><AvatarFallback>AB</AvatarFallback></Avatar>
      <Avatar size="sm"><AvatarFallback>AB</AvatarFallback></Avatar>
      <Avatar size="md"><AvatarFallback>AB</AvatarFallback></Avatar>
      <Avatar size="lg"><AvatarFallback>AB</AvatarFallback></Avatar>
      <Avatar size="xl"><AvatarFallback>AB</AvatarFallback></Avatar>
    </DemoSection>

    <DemoSection
      title="With image"
      codeTitle="AvatarImage + initials fallback"
      codeDescription="Kobalte's Image primitive sets data-loading-status, so the fallback shows while the image loads and stays if it errors."
      code={`<Avatar size="lg">
  <AvatarImage src="https://i.pravatar.cc/96?img=12" alt="Avatar" />
  <AvatarFallback>RD</AvatarFallback>
</Avatar>

{/* src fails to load — the fallback stays put */}
<Avatar size="lg">
  <AvatarImage src="https://broken.invalid/x.png" alt="broken" />
  <AvatarFallback>FB</AvatarFallback>
</Avatar>`}
    >
      <Avatar size="lg">
        <AvatarImage
          src="https://i.pravatar.cc/96?img=12"
          alt="Avatar"
        />
        <AvatarFallback>RD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="https://broken.invalid/x.png" alt="broken" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>
    </DemoSection>

    <DemoSection
      title="Group with overflow"
      codeTitle="max collapses the tail into a +N avatar"
      codeDescription={
        <>
          <code>size</code> sizes the +N overflow avatar; <code>spacing</code>{" "}
          (tight · default · loose) controls the stack overlap.
        </>
      }
      code={`<AvatarGroup max={3} size="md">
  <Avatar><AvatarFallback>A</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>B</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>C</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>D</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>E</AvatarFallback></Avatar>
</AvatarGroup>`}
    >
      <AvatarGroup max={3} size="md">
        <Avatar><AvatarFallback>A</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>B</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>C</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>D</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>E</AvatarFallback></Avatar>
      </AvatarGroup>
    </DemoSection>
  </DemoPage>
);

export default NewAvatarDemo;
