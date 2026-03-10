// Define the type of the environment variables.
declare interface Env {
  readonly NODE_ENV: string;
  readonly NG_APP_COLYSEUS_HTTP_URL: string;
  readonly NG_APP_COLYSEUS_WS_URL: string;
}

declare interface ImportMeta {
  readonly env: Env;
}
