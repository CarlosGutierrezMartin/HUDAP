/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// WebGL for the particle body. "angle" works headless on Linux and macOS.
Config.setChromiumOpenGlRenderer("angle");
// Use a local Chromium when REMOTION_BROWSER is set (e.g. when the Remotion download host is blocked).
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
