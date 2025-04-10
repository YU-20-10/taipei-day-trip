from fastapi import APIRouter
from fastapi.responses import JSONResponse
import json

from model.attractions_data_operation import Attractions_data_operation

attraction_api = APIRouter()


@attraction_api.get("/api/attractions", response_class=JSONResponse)
async def attractions(page: int, keyword: str | None = None):
    attractions_data = []
    try:
        attractions_row_data = Attractions_data_operation.get_attractions_data(
            page, keyword
        )
        for attraction in attractions_row_data:
            input_data = {
                "id": attraction[0],
                "name": attraction[1],
                "category": attraction[2],
                "description": attraction[3],
                "address": attraction[4],
                "transport": attraction[5],
                "mrt": attraction[6],
                "lat": attraction[7],
                "lng": attraction[8],
                "images": json.loads(attraction[9]),
            }
            attractions_data.append(input_data)
        # 依據取得資料，判定有無下一頁
        if len(attractions_data) > 12:
            return JSONResponse(
                status_code=200,
                content={
                    "nextPage": page + 1,
                    "data": attractions_data[0:12],
                },
                media_type="application/json; charset=utf-8",
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"nextPage": None, "data": attractions_data},
                media_type="application/json; charset=utf-8",
            )
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(e)},
            media_type="application/json; charset=utf-8",
        )


@attraction_api.get("/api/attraction/{attractionId}", response_class=JSONResponse)
async def get_attractions_by_id(attractionId: int):
    try:
        attractions_data = Attractions_data_operation.get_attraction_by_id(attractionId)
        return JSONResponse(
            status_code=200,
            content={"data": attractions_data},
            media_type="application/json; charset=utf-8",
        )
    except Exception:
        print(Exception)
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(Exception)},
            media_type="application/json; charset=utf-8",
        )
