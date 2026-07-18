import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form-builder/form";
import { Input } from "./form/input/input";
import { Textarea } from "./form/input/textarea";
import { Checkbox } from "./form/checkbox/checkbox";
import { Switch } from "./form/switch/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./form/select/select";
import { RadioGroup, RadioGroupItem } from "./form/radio/radio-group";
import { Slider } from "./form/slider/slider";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  plan: z.enum(["free", "pro", "team"]),
  priority: z.enum(["low", "medium", "high"]),
  bio: z.string().max(120, "Keep it under 120 characters").optional(),
  newsletter: z.boolean(),
  notifications: z.boolean(),
  volume: z.tuple([z.number().min(0).max(100)]),
  agree: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms",
  }),
});

type Values = z.infer<typeof schema>;

const NewFormDemo: React.FC = () => {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      fullName: "",
      plan: "free",
      priority: "medium",
      bio: "",
      newsletter: false,
      notifications: true,
      volume: [50],
      agree: false,
    },
    mode: "onTouched",
  });

  const onSubmit = (values: Values) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <div className="demo-page">
      <h1>Form (new — shadcn pattern on react-hook-form)</h1>
      <p className="lede">
        Headless validation via <code>react-hook-form</code> + Zod (or any
        other resolver). The <code>Form*</code> primitives wire labels,
        descriptions, and error messages to the right input via{" "}
        <code>id</code> / <code>aria-describedby</code> /{" "}
        <code>aria-invalid</code> automatically — no hand-wiring per field.
      </p>

      <section className="demo-section">
        <h2>1. Composing every primitive</h2>
        <CodeExample
          title="Single form, every new component, with Zod validation"
          description="Submit with invalid values to see field-level errors. The submit shows the validated values."
          code={`const schema = z.object({
  email: z.string().email(),
  plan: z.enum(["free", "pro", "team"]),
  agree: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  // …
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl><Input type="email" {...field} /></FormControl>
          <FormDescription>We'll never share it.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    {/* …same shape for every other field… */}
    <Button type="submit">Submit</Button>
  </form>
</Form>`}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              style={{
                display: "grid",
                gap: "1rem",
                width: "100%",
                maxWidth: 520,
              }}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@algorisys.com" {...field} />
                    </FormControl>
                    <FormDescription>We'll never share it.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: "0.75rem",
                        }}
                      >
                        {(["low", "medium", "high"] as const).map((v) => (
                          <label
                            key={v}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: "0.8125rem",
                            }}
                          >
                            <RadioGroupItem value={v} />
                            <span style={{ textTransform: "capitalize" }}>{v}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification volume</FormLabel>
                    <FormControl>
                      <Slider
                        value={field.value}
                        onValueChange={field.onChange}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </FormControl>
                    <FormDescription>Current: {field.value[0]}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea rows={3} maxLength={120} {...field} />
                    </FormControl>
                    <FormDescription>
                      {(field.value?.length ?? 0)} / 120
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notifications"
                render={({ field }) => (
                  <FormItem
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <FormLabel>Email notifications</FormLabel>
                      <FormDescription>
                        Send a summary every Monday morning.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newsletter"
                render={({ field }) => (
                  <FormItem style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(v === true)}
                      />
                    </FormControl>
                    <FormLabel style={{ margin: 0 }}>
                      Subscribe to the Algorisys newsletter
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agree"
                render={({ field }) => (
                  <FormItem>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(v === true)}
                        />
                      </FormControl>
                      <FormLabel style={{ margin: 0 }}>
                        I agree to the terms of service
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Button type="submit">Submit</Button>
                <Button
                  type="button"
                  variant="outline"
                  color="neutral"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Notes</h2>
        <CodeExample
          title="What the Form primitives give you for free"
          code={`Form primitives + react-hook-form + Zod →

- <FormLabel>      gets the right htmlFor= via context (no manual id)
- <FormControl>    is a Radix Slot that injects id, aria-describedby,
                   and aria-invalid into the underlying input
- <FormDescription> is auto-linked via aria-describedby
- <FormMessage>    auto-renders the field's validation error message
                   and joins aria-describedby; hidden when no error

So you write the layout once; a11y and error-text-to-control wiring
fall out automatically. Switch resolver to yup / valibot / joi any
time — react-hook-form doesn't care.`}
        >
          <p style={{ color: "var(--zen-color-muted-fg)", margin: 0, fontSize: "0.8125rem" }}>
            See the code snippet for the rundown.
          </p>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewFormDemo;
