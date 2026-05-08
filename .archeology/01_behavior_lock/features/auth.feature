Feature: Authentication & User Governance
  Scenario: JWT Session Management
    Given valid user credentials
    When a login request is made
    Then the system returns a JWT token and user metadata.
    Proof: backend/app/routers/auth.py:L45-60

  Scenario: Profile Photo Persistence
    Given an authenticated user
    When uploading a profile image
    Then the system stores the file and updates the Usuario record.
    Proof: backend/app/routers/auth.py:L140-155
