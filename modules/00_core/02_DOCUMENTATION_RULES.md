# 02_DOCUMENTATION_RULES

## Default ICU evolution order

1. Header
2. Introductory clinical statement
3. Diagnoses
4. Subjective
5. Vital signs
6. Physical examination by systems
7. Integrated analysis
8. Plan
9. Scores
10. Prognosis
11. Signatures

## Standard systems

- Neurológico
- Respiratorio
- Hemodinámico
- Nefro-urinario
- Gastro-metabólico
- Hematoinfeccioso

## Blank labs

If the user says:
- “deja espacios”
- “deja los labs en blanco”
- “que los complete la guardia”

Use:
`______`

Do not write “pendiente” repeatedly unless the user asks for it.

## Corrections

If the user corrects a value:
- Update the affected calculation.
- Update the affected organ-system section.
- Update analysis, plan, scores and prognosis if impacted.
- If the user says “dame toda la nota”, regenerate the full note.
