# Blocks

## Setup
- npm install
- npm start

## Prettier
Setup prettier: https://www.jetbrains.com/help/idea/prettier.html

## Wasm

Build wasm

`GOOS=js GOARCH=wasm go build -o main.wasm`

Get wasm_exec 

`cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .`
