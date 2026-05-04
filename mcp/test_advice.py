import asyncio
import os
from server import lbms_get_technical_advice, IdInput

async def main():
    os.environ["LBMS_EMAIL"] = "jalban.arq@gmail.com"
    os.environ["LBMS_PASSWORD"] = "Kronos2026"

    inp = IdInput(id="f38ee831-92de-4a85-b2fc-f9a0e2b4b368")
    result = await lbms_get_technical_advice(inp)
    print("INSIGHTS CIENTÍFICOS:", result)

if __name__ == "__main__":
    asyncio.run(main())
