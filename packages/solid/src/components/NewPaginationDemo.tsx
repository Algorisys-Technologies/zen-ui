import { createSignal } from "solid-js";
import { Pagination } from "./pagination/pagination";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewPaginationDemo = () => {
  const [page, setPage] = createSignal(1);
  const [page2, setPage2] = createSignal(6);

  return (
    <DemoPage
      title="Pagination"
      description={
        <>
          Standalone, controlled page navigator for lists / cards / server-driven
          feeds (zen-ui's <code>DataTable</code> has its own built-in pager).
          Renders Prev / numbered pages with ellipses / Next. <code>page</code> is
          1-based.
        </>
      }
    >
      <DemoSection
        title="1. Basic"
        codeTitle={`page ${page()} of 10`}
        code={`const [page, setPage] = createSignal(1);

<Pagination page={page()} pageCount={10} onPageChange={setPage} />`}
      >
        <Pagination page={page()} pageCount={10} onPageChange={setPage} />
      </DemoSection>

      <DemoSection
        title="2. Many pages (ellipsis on both sides)"
        codeTitle={`page ${page2()} of 50`}
        code={`<Pagination page={page2()} pageCount={50} onPageChange={setPage2} />`}
      >
        <Pagination page={page2()} pageCount={50} onPageChange={setPage2} />
      </DemoSection>

      <DemoSection
        title="3. Wider sibling/boundary window"
        codeTitle="siblingCount + boundaryCount control how many numbers show"
        code={`<Pagination
  page={page2()}
  pageCount={50}
  onPageChange={setPage2}
  siblingCount={2}
  boundaryCount={2}
/>`}
      >
        <Pagination
          page={page2()}
          pageCount={50}
          onPageChange={setPage2}
          siblingCount={2}
          boundaryCount={2}
        />
      </DemoSection>

      <DemoSection
        title="4. Numbers only (no Prev / Next)"
        codeTitle="hidePrevNext"
        code={`<Pagination page={page()} pageCount={8} onPageChange={setPage} hidePrevNext />`}
      >
        <Pagination page={page()} pageCount={8} onPageChange={setPage} hidePrevNext />
      </DemoSection>
    </DemoPage>
  );
};

export default NewPaginationDemo;
