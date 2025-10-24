import "server-only";

import React from "react";


interface HtmlOpts {
  width: number;
  height: number;
  head?: string;
  bodyClass?: string;
}

export async function renderComponentToHtml(node: React.ReactElement, opts: HtmlOpts) {
  // EN: Dynamically import react-dom/server to avoid Next.js build issues
  const ReactDOMServer = await import("react-dom/server").then(mod => mod.default || mod);

  // EN: Wrap JSX in a full HTML document; include width/height container for predictable layout
  const { width, height, head = "", bodyClass = "" } = opts;
  const markup = ReactDOMServer.renderToStaticMarkup(
    <div id="capture" className={`w-[${width}px] h-[${height}px] flex items-center justify-center ${bodyClass}`}>
      {node}
    </div>
  );

  return `<!doctype html>
<html lang="en">
<head>
${head}
</head>
<body>
${markup}
</body>
</html>`;
}