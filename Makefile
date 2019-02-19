# I usually keep a `VERSION` file in the root so that anyone
# can clearly check what's the VERSION of `master` or any
# branch at any time by checking the `VERSION` in that git
# revision.
#
# Another benefit is that we can pass this file to our Docker
# build context and have the version set in the binary that ends
# up inside the Docker image too.
VERSION         :=      $(shell cat ./VERSION)
SRC      		:=      cmd/app
DIST      		:=      dist


# As a call to `make` without any arguments leads to the execution
# of the first target found I really prefer to make sure that this
# first one is a non-destructive one that does the most simple
# desired installation.
#
# It's very common to people set it as `all` but it could be anything
# like `a`.
all: build

build:
	GOOS=js GOARCH=wasm go build -o $(DIST)/main.wasm $(SRC)/main.go
	npm --prefix web run build

# Install just performs a normal `go install` which builds the source
# files from the package at `./` (I like to keep a `main.go` in the root
# that imports other subpackages).
#
# As I always commit `vendor` to `git`, a `go install` will typically
# always work - except if there's an OS limitation in the build flags
# (e.g, a linux-only project).
install:
	go install -v $(SRC)/main.go


# Keeping `./main.go` with just a `cli` and `./lib/*.go` with actual
# logic, `tests` usually reside under `./lib` (or some other subdirectories).
#
# By using the `./...` notation, all the non-vendor packages are going
# to be tested if they have test files.
test:
	go test ./... -v


# Just like `test`, formatting what matters. As `main.go` is in the root,
# `go fmt` the root package. Then just `cd` to what matters to you (`vendor`
# doesn't matter).
#
# By using the `./...` notation, all the non-vendor packages are going
# to be formatted (including test files).
fmt:
	go fmt ./...

# This is pretty much an optional thing that I tend always to include.
#
# Here in this target With just a simple `make release` you can have a
# `tag` created in GitHub with multiple builds if you wish.
#
# See more at `gorelease` github repo.
release:
	git tag -a $(VERSION) -m "Release" || true
	git push origin $(VERSION)

.PHONY: install test fmt release
