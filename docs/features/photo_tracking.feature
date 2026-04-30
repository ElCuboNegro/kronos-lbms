Feature: Photographic Evolution Tracking
  As a lab researcher
  I want to attach directional photos to a specimen's evolution logs
  So that I can visually track morphological changes, variegation stability, and plant health over time

  Background:
    Given I am logged into the LBMS
    And a specimen exists in the system

  Scenario: Log a new evolution step with a photo
    Given I am viewing the specimen's detail page
    When I create a new evolution record (Registro Evolucion)
    And I provide basic growth metrics (e.g., height, number of leaves)
    And I upload a photo to the "frente" (front) angle
    Then the evolution record should be saved
    And the image file should be stored on the server securely
    And the evolution record's metadata should link the "frente" angle to the specific photo URL

  Scenario: Support multiple standard photo angles
    Given I have created a new evolution record for a specimen
    When I upload multiple photos to the same record, specifying different angles:
      | Angle       | File Type |
      | arriba      | .jpg      |
      | izquierda   | .png      |
      | derecha     | .webp     |
    Then the system should accept all valid image formats
    And it should link all specified angles into the `fotos` JSON object of the evolution record

  Scenario: Reject invalid photo angles
    Given I have created an evolution record
    When I attempt to upload a photo using an unrecognized angle like "diagonal"
    Then the system should reject the upload with an Unprocessable Entity error (Status 422)
    And it should specify the allowed angles (arriba, frente, atras, izquierda, derecha)

  Scenario: Reject invalid file types
    Given I have created an evolution record
    When I attempt to upload a document (e.g., .pdf) or an unsupported image format (e.g., .gif)
    Then the system should reject the upload with an Unsupported Media Type error (Status 415)
    And it should notify me that only JPEG, PNG, or WebP are allowed

  Scenario: View historical evolution photos
    Given an evolution record exists with a "frente" photo uploaded last month
    When I request to view the "frente" photo for that specific evolution record
    Then the system should successfully locate and return the image file to my browser/app
