import asyncio
from server import lbms_list_sustratos

async def main():
    res = await lbms_list_sustratos()
    print("Respuesta bruta:", res)

if __name__ == "__main__":
    asyncio.run(main())
