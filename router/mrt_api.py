from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from db_config import db_get_connection
from model.mrt_data_operation import Mrt_data_opertation

mrt_api = APIRouter()


@mrt_api.get("/api/mrts", response_class=JSONResponse)
async def mrt(database_connect=Depends(db_get_connection)):
    try:
        mrt_data = Mrt_data_opertation.get_mrt_data(database_connect)
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
