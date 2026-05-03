import asyncio
from server import lbms_imprimir_especimen, ImprimirIdInput

async def main():
    inp = ImprimirIdInput(id="a58f3943-0c69-4169-ad95-72abe245095b")
    result = await lbms_imprimir_especimen(inp)
    print("Resultado MCP:", result)

if __name__ == "__main__":
    asyncio.run(main())
