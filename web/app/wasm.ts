import "../vendor/wasm/wasm_exec.js"

declare var Go;

const go = new Go();

// @ts-ignore
WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then((result) => {
    go.run(result.instance);
});
