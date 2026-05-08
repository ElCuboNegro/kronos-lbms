Feature: Model Context Protocol (AI Interface)
  Scenario: Inventory Exposure to LLM
    Given an AI agent connected via FastMCP
    When querying 'lbms_list_reactivos'
    Then the system returns a serialized JSON of the laboratory state.
    Proof: mcp/server.py:L80-120

  Scenario: Direct State Update via Agent
    Given an AI agent instruction
    When executing 'lbms_update_formulacion'
    Then the MCP server proxies the request to the FastAPI backend.
    Proof: mcp/server.py:L200-220
