/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    toolname?: string;
    tooldescription?: string;
    toolparamdescription?: string;
    toolautosubmit?: boolean | string;
  }
}
