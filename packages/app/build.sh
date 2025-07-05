#!/bin/bash

bun vite build
zip -r -1 build/drizzle.zip ./drizzle
bun build --compile --minify --outfile=./build/romm-sync --production --external '@aws-sdk/client-s3' --asset-naming="[name].[ext]" ./src/index.ts