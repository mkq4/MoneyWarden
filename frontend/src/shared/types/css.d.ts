import "react";

declare module "react" {
  /** CSS-переменные в style={{ "--name": value }} без приведения типов. */
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
