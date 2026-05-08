Feature: Scientific Data Entry Forms
  Scenario: Bulk Specimen Creation Workflow
    Given the IndividuoMultiCreate form
    When entering prefix, quantity, and genetic lineage
    Then the UI validates the input and calls the backend bulk endpoint.
    Proof: frontend/src/pages/IndividuoMultiCreate.jsx

  Scenario: Lab Batch Preparation (Lotes)
    Given the LotePreparacionForm
    When selecting a formulation
    Then the UI calculates the target concentration and allows setting the volume.
    Proof: frontend/src/components/LotePreparacionForm.jsx
