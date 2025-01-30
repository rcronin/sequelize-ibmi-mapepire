#!/bin/bash

# Compile TypeScript files
tsc

# Copy the query.d.ts file
cp src/query.d.ts dist/query.d.ts

# Copy the query-generator.d.ts file
cp src/query-generator.d.ts dist/query-generator.d.ts