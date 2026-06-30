# Architecture

Critical Care OS is organized into layered modules.

## Layer 0 — Core

Global behavior used by every module:
- System rules
- Writing style
- ICU documentation standards
- Clinical reasoning rules
- Calculations
- Scores

## Layer 1 — Documentation

Modules that generate clinical documents:
- Evolution notes
- Admission notes
- Discharge notes
- Consult notes
- Handoffs
- Family updates
- Procedures

## Layer 2 — Physiology

Modules that interpret ICU physiology:
- Mechanical ventilation
- Gasometry
- Hemodynamics
- Shock
- Renal replacement therapy
- Electrolytes
- Acid-base
- Nutrition
- Sedation and analgesia

## Layer 3 — Specialties

Domain-specific ICU modules:
- Neurocritical care
- Sepsis
- Infectious diseases
- Cardiovascular ICU
- Hematology
- Liver failure
- Toxicology

## Layer 4 — Imaging

Actionable imaging interpretation:
- CT brain
- CT chest
- MRI
- Lung ultrasound
- Critical care echo
- TCD
- X-ray

## Layer 5 — Research

Academic workflows:
- RCT appraisal
- Guidelines
- Systematic reviews
- Journal club
- Presentations

## Layer 6 — Automation

Reusable calculators and structured outputs:
- Drug calculator
- Ventilator calculator
- Hemodynamic calculator
- Renal calculator
- Nutrition calculator
- Antibiotic PK/PD

## Activation principle

A module should activate when the user's request matches its scope.  
If multiple modules apply, combine them without duplicating text.

Example:
- “Haz la nota vespertina con esta gasometría” activates:
  - ICU Evolution Notes
  - ABG Interpretation
  - Mechanical Ventilation
  - ICU Calculations
  - ICU Scores
