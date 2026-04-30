Feature: Authentication and Role-Based Access Control
  As a laboratory system administrator
  I want to manage users, their roles, and their security credentials
  So that the system remains secure and data integrity is maintained

  Background:
    Given the LBMS backend is running

  Scenario: User Login
    Given an active user with the email "tecnico@lab.com" and a valid password exists
    When I submit the correct credentials to the login endpoint
    Then the system should authenticate the user
    And it should return a JWT Bearer access token for subsequent requests

  Scenario: Prevent inactive user login
    Given a user account exists but is marked as inactive (`activo=False`)
    When I submit the correct credentials for this account
    Then the system should reject the login with a Forbidden error (Status 403)
    And no access token should be issued

  Scenario: Register a new user (Admin only)
    Given I am logged in as a user with the "admin" role
    When I attempt to register a new user with the email "nuevo@lab.com" and role "tecnico"
    Then the system should securely hash the provided password
    And the new user account should be created

  Scenario: User password update
    Given I am logged into the LBMS
    When I request to change my password
    And I provide my current password correctly alongside a new valid password (min 8 characters)
    Then the system should securely update my password hash

  Scenario: Upload user profile photo
    Given I am logged into the LBMS
    When I upload a profile photo (JPEG, PNG, or WebP)
    Then the image should be saved to the server
    And my user profile (`foto_url`) should be updated to point to the new image
