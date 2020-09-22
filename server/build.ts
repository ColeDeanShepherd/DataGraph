import * as shelljs from "shelljs";

export {} // get around "All files must be modules when the '--isolatedModules' flag is provided."

// delete output folder
shelljs.rm("-r", "./dist");

// run TypeScript compiler
shelljs.exec("tsc");

// copy self-signed cert for local HTTPS
shelljs.cp(["localssl.cert", "localssl.key"], "./dist");