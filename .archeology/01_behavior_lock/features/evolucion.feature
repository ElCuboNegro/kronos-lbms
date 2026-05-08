Feature: Specimen Timeline & Photos
  Scenario: Evolution Record with Config Inheritance
    Given a specimen with a specific genetic lineage
    When an evolution record is added
    Then it inherits environmental defaults from the Line/Species.
    Proof: backend/app/routers/evolucion.py:L70-85

  Scenario: Chronological Photo Tracking
    Given multiple evolution entries over time
    When viewing the specimen timeline
    Then the system displays photos in descending chronological order.
    Proof: backend/app/routers/evolucion.py:L110
