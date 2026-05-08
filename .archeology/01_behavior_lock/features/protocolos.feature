Feature: Protocol Management
  As a researcher
  I want to create, validate, and extract protocols from documents.

  Scenario: Extract protocol from document (Success)
    Given a valid image or PDF document
    And a functional Gemini AI API key
    When the user uploads the document for extraction
    Then the system parses the document and returns a structured protocol draft (line 38-58)
    And defaults the protocol type to "otro" if the AI returns an invalid value (line 59-60)

  Scenario: Extract protocol (Unsupported file type)
    Given a file that is not an image or PDF
    When the user uploads the document
    Then the system raises a 415 error "Solo se soportan imágenes y PDFs" (line 35)

  Scenario: Extract protocol (Missing API Key)
    Given a server without GEMINI_API_KEY configured
    When any user tries to extract a protocol
    Then the system raises a 500 error "GEMINI_API_KEY no configurada" (line 33)

  Scenario: Create protocol (Success)
    Given a valid protocol payload
    And a valid protocol type
    When the user creates the protocol
    Then the system registers the protocol and links it to the current user (line 80-87)

  Scenario: Create protocol (Invalid Type)
    Given a protocol payload with an invalid type
    When the user creates the protocol
    Then the system raises a 422 error "Tipo inválido" (line 81)

  Scenario: Get protocol by ID or Code (Success)
    Given a valid UUID or protocol code
    When the user requests the protocol
    Then the system performs a fallback search and returns the full details including validations (line 155-177)

  Scenario: Get protocol (Not Found)
    Given an ID or code that does not match any protocol
    When the user requests the protocol
    Then the system raises a 404 error "Protocolo no encontrado" (line 162)

  Scenario: Add validation to protocol (Success)
    Given a valid protocol ID
    And a valid validation result ("exitoso", "fallido", "parcial")
    When the user adds the validation
    Then the system registers the validation (line 124-132)
    And updates the protocol status to "validado" if the result is "exitoso" (line 134-135)

  Scenario: Add validation (Invalid Result)
    Given a validation payload with an invalid result value
    When the user adds the validation
    Then the system raises a 422 error "Resultado inválido" (line 122)

  Scenario: Add validation (Protocol Not Found)
    Given a non-existent protocol ID
    When the user adds a validation
    Then the system raises a 404 error "Protocolo no encontrado" (line 120)
