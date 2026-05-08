Feature: Reagent & Formulation Management
  Scenario: Nested Formulation Support
    Given a complex reagent mixture
    When creating a new formulation that uses another formulation as ingredient
    Then the system must allow nested dependencies.
    Proof: backend/app/routers/reactivos.py

  Scenario: Expiration Tracking
    Given a prepared batch (Lote)
    When its shelf life expires
    Then the status must be updated to 'expired'.
    Proof: backend/app/routers/reactivos.py
