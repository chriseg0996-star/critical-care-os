# Critical Care OS

**Critical Care OS** is a modular ChatGPT Project knowledge base for ICU documentation, clinical reasoning, calculations, and critical care workflows.

This repository is designed to be uploaded into a ChatGPT Project as project knowledge.

## Current version

`v0.1.0` — Architecture and core scaffold.

## Design goals

- Generate ICU documentation in a consistent Spanish critical care style.
- Reduce repetitive prompting.
- Automatically perform ICU calculations when sufficient data exist.
- Preserve the user's documentation voice.
- Avoid invented clinical data.
- Integrate clinical data into organ-system reasoning.
- Maintain versioned, modular, testable instructions.

## Repository structure

```text
docs/              Architecture, roadmap, changelog
modules/           Modular knowledge files
templates/         Copy-paste-ready note and prompt templates
examples/          Example outputs
tests/             Clinical test cases for regression checks
```

## Core principle

This is not a prompt collection. It is a versioned ICU reasoning and documentation system.
