/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { Map } from "./map/map";
import { CodeExample } from "./demo-helpers";

const MARKERS = [
  { position: [19.076, 72.8777] as [number, number], label: "Mumbai" },
  { position: [18.5204, 73.8567] as [number, number], label: "Pune" },
];

const NewMapDemo: React.FC = () => {
  // Leaflet's default marker icons reference asset URLs that bundlers rewrite;
  // point them at the CDN so markers render in the demo.
  useEffect(() => {
    import("leaflet").then((L: any) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  return (
    <div className="demo-page">
      <h1>Map</h1>
      <p className="lede">
        Leaflet map wrapping <code>react-leaflet</code> + <code>leaflet</code>{" "}
        (<strong>optional</strong> peer deps, lazy-loaded on first render).
        Import Leaflet's CSS once in your app:{" "}
        <code>import "leaflet/dist/leaflet.css"</code>.
      </p>

      <section className="demo-section">
        <h2>1. Map with markers</h2>
        <CodeExample
          title="center / zoom / markers"
          code={`<Map
  center={[19.076, 72.8777]}
  zoom={7}
  markers={[
    { position: [19.076, 72.8777], label: "Mumbai" },
    { position: [18.5204, 73.8567], label: "Pune" },
  ]}
/>`}
        >
          <div style={{ width: "100%" }}>
            <Map center={[18.9, 73.2]} zoom={7} markers={MARKERS} height={320} />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewMapDemo;
