# Blocks

- use yarn instead of npm

## Wasm

Build wasm

`GOOS=js GOARCH=wasm go build -o main.wasm`

Get wasm_exec 

`cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .`


// TODO
https://www.devdungeon.com/content/working-images-go
https://github.com/avelino/awesome-go
https://blog.golang.org/go-image-package