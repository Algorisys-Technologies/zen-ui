import { useState } from "react";
import { Pagination } from "./pagination/pagination";
import { CodeExample } from "./demo-helpers";

const NewPaginationDemo: React.FC = () => {
  const [page, setPage] = useState(1);
  const [page2, setPage2] = useState(6);

  return (
    <div className="demo-page">
      <h1>Pagination</h1>
      <p className="lede">
        Standalone, controlled page navigator for lists / cards / server-driven
        feeds (zen-ui's <code>DataTable</code> has its own built-in pager).
        Renders Prev / numbered pages with ellipses / Next. <code>page</code> is
        1-based.
      </p>

      <section className="demo-section">
        <h2>1. Basic</h2>
        <CodeExample
          title={`page ${page} of 10`}
          code={`const [page, setPage] = useState(1);

<Pagination page={page} pageCount={10} onPageChange={setPage} />`}
        >
          <Pagination page={page} pageCount={10} onPageChange={setPage} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Many pages (ellipsis on both sides)</h2>
        <CodeExample
          title={`page ${page2} of 50`}
          code={`<Pagination page={page2} pageCount={50} onPageChange={setPage2} />`}
        >
          <Pagination page={page2} pageCount={50} onPageChange={setPage2} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Wider sibling/boundary window</h2>
        <CodeExample
          title="siblingCount + boundaryCount control how many numbers show"
          code={`<Pagination
  page={page2}
  pageCount={50}
  onPageChange={setPage2}
  siblingCount={2}
  boundaryCount={2}
/>`}
        >
          <Pagination
            page={page2}
            pageCount={50}
            onPageChange={setPage2}
            siblingCount={2}
            boundaryCount={2}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Numbers only (no Prev / Next)</h2>
        <CodeExample
          title="hidePrevNext"
          code={`<Pagination page={page} pageCount={8} onPageChange={setPage} hidePrevNext />`}
        >
          <Pagination page={page} pageCount={8} onPageChange={setPage} hidePrevNext />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewPaginationDemo;
