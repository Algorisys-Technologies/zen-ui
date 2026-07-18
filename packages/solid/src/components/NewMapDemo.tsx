/* eslint-disable @typescript-eslint/no-explicit-any */
import { onMount } from "solid-js";
import "leaflet/dist/leaflet.css";
import { Map } from "./map/map";
import { DemoPage, DemoSection } from "./demo-helpers";

const MARKERS = [
  { position: [19.076, 72.8777] as [number, number], label: "Mumbai" },
  { position: [18.5204, 73.8567] as [number, number], label: "Pune" },
];

const NewMapDemo = () => {
  // Leaflet's default marker icons reference asset URLs that bundlers rewrite;
  // point them at the CDN so markers render in the demo.
  onMount(() => {
    import("leaflet")
      .then((mod: any) => {
        const L = mod?.default ?? mod;
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
      })
      .catch(() => {
        // leaflet is an optional peer dep — <Map> renders its own install hint.
      });
  });

  return (
    <DemoPage
      title="Map"
      description="Leaflet map wrapping leaflet (an optional peer dependency, lazy-loaded on first render). The React binding also needs react-leaflet; Leaflet itself is framework-agnostic, so Solid drives it directly and only leaflet is needed. Import Leaflet's CSS once in your app: import 'leaflet/dist/leaflet.css'."
    >
      <DemoSection
        title="1. Map with markers"
        codeTitle="center / zoom / markers"
        code={`<Map
  center={[19.076, 72.8777]}
  zoom={7}
  markers={[
    { position: [19.076, 72.8777], label: "Mumbai" },
    { position: [18.5204, 73.8567], label: "Pune" },
  ]}
/>`}
      >
        <div class="zen-w-full">
          <Map center={[18.9, 73.2]} zoom={7} markers={MARKERS} height={320} />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewMapDemo;
