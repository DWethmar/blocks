# Blocks

- use yarn instead of npm



## Wasm

Build wasm

`GOOS=js GOARCH=wasm go build -o main.wasm`

Get wasm_exec 

`cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .`


// TODO
https://blog.logrocket.com/setting-up-a-monorepo-with-lerna-for-a-typescript-project-b6a81fe8e4f8