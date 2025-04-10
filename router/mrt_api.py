from fastapi import APIRouter
from fastapi.responses import JSONResponse

from model.mrt_data_operation import Mrt_data_opertation

mrt_api = APIRouter()


@mrt_api.get("/api/mrts", response_class=JSONResponse)
async def mrt():
    try:
        mrt_data = Mrt_data_opertation.get_mrt_data()
        return JSONResponse(
            status_code=200,
            content={"data": mrt_data},
            media_type="application/json; charset=utf-8",
        )
    except Exception:
        print(Exception)
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(Exception)},
            media_type="application/json; charset=utf-8",
        )
