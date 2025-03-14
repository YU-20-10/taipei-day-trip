# from fastapi import *
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
import mysql.connector
import json

app = FastAPI()


# ******
def database():
    return mysql.connector.connect(
        host="127.0.0.1", user="test", passwd="Test@1234", database="taipei_trip"
    )


# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
    return FileResponse("./static/index.html", media_type="text/html")


@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
    return FileResponse("./static/attraction.html", media_type="text/html")


@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
    return FileResponse("./static/booking.html", media_type="text/html")


@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
    return FileResponse("./static/thankyou.html", media_type="text/html")


@app.get("/api/attractions", response_class=JSONResponse)
async def attractions(page: int, keyword: str | None = None):
    attractions_data = []
    try:
        database_connect = database()
        database_connect_cursor = database_connect.cursor()
        # 依據是否輸入捷運站名稱進行不同的MySQL查詢
        if keyword:
            database_connect_cursor.execute(
                "SELECT attractions.id,attractions.name AS attractions_name,attractions.category,attractions.description,attractions.address,attractions.transport,mrt.name AS mrt_name,attractions.lat,attractions.lng,attractions.images FROM attractions INNER JOIN mrt ON attractions.mrt_id=mrt.id WHERE mrt.name=%s AND attractions.name LIKE %s ORDER BY attractions.id",
                [keyword, f"%{keyword}%"],
            )
        else:
            database_connect_cursor.execute(
                "SELECT attractions.id,attractions.name AS attractions_name,attractions.category,attractions.description,attractions.address,attractions.transport,mrt.name AS mrt_name,attractions.lat,attractions.lng,attractions.images FROM attractions INNER JOIN mrt ON attractions.mrt_id=mrt.id ORDER BY attractions.id"
            )
        attractions_row_data = database_connect_cursor.fetchall()
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
        # 處理mrt=None的資料
        database_connect_cursor.execute(
            "SELECT * FROM attractions WHERE mrt_id IS NULL"
        )
        none_mrt_data = database_connect_cursor.fetchall()
        for data in none_mrt_data:
            input_data = {
                "id": data[0],
                "name": data[1],
                "category": data[2],
                "description": data[3],
                "address": data[4],
                "transport": data[5],
                "mrt": data[6],
                "lat": data[7],
                "lng": data[8],
                "images": json.loads(data[9]),
            }
            attractions_data.insert(data[0] - 1, input_data)
        database_connect_cursor.close()
        database_connect.close()
        # 依據得到結果return資料
        if len(attractions_data) >= 12:
            if page == 1 and len(attractions_data) > 12:
                return {"nextPage": 1, "data": attractions_data[0:12]}
            elif page > 1:
                return {
                    "nextPage": page,
                    "data": attractions_data[(12 * (page - 1)) : (12 * page)],
                }
        elif 12 >= len(attractions_data) > 0:
            return JSONResponse(
                status_code=200,
                content={"nextPage": None, "data": attractions_data},
                media_type="application/json; charset=utf-8",
            )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(e)},
            media_type="application/json; charset=utf-8",
        )


@app.get("/api/attractions/{attractionId}", response_class=JSONResponse)
async def get_attractions_by_id(attractionId: int):
    try:
        attractions_data = {}
        database_connect = database()
        database_connect_cursor = database_connect.cursor()
        database_connect_cursor.execute(
            "SELECT attractions.id,attractions.name AS attractions_name,attractions.category,attractions.description,attractions.address,attractions.transport,mrt.name AS mrt_name,attractions.lat,attractions.lng,attractions.images FROM attractions INNER JOIN mrt ON attractions.mrt_id=mrt.id WHERE attractions.id=%s",
            [attractionId],
        )
        row_data = database_connect_cursor.fetchone()
        if row_data:
            attractions_data = {
                "id": row_data[0],
                "name": row_data[1],
                "category": row_data[2],
                "description": row_data[3],
                "address": row_data[4],
                "transport": row_data[5],
                "mrt": row_data[6],
                "lat": row_data[7],
                "lng": row_data[8],
                "images": json.loads(row_data[9]),
            }
        else:
            database_connect_cursor.execute(
                "SELECT * FROM attractions WHERE mrt_id IS NULL AND id=%s",
                [attractionId],
            )
            none_mrt_data = database_connect_cursor.fetchone()
            attractions_data = {
                "id": none_mrt_data[0],
                "name": none_mrt_data[1],
                "category": none_mrt_data[2],
                "description": none_mrt_data[3],
                "address": none_mrt_data[4],
                "transport": none_mrt_data[5],
                "mrt": none_mrt_data[6],
                "lat": none_mrt_data[7],
                "lng": none_mrt_data[8],
                "images": json.loads(none_mrt_data[9]),
            }
        return JSONResponse(
            status_code=200,
            content={"data": attractions_data},
            media_type="application/json; charset=utf-8",
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"error": "ok", "message": str(Exception)},
            media_type="application/json; charset=utf-8",
        )


@app.get("/api/mrts", response_class=JSONResponse)
async def mrt():
    try:
        mrt_data = []
        database_connect = database()
        database_connect_cursor = database_connect.cursor()
        database_connect_cursor.execute(
            "SELECT attractions.mrt_id,mrt.name FROM attractions INNER JOIN mrt ON attractions.mrt_id=mrt.id"
        )
        mrt_row_data = database_connect_cursor.fetchall()
        data = {}
        for mrt in mrt_row_data:
            # print(mrt)
            # print(data.get(mrt[1], None))
            if data.get(mrt[1], None) is None:
                data[mrt[1]] = 1
            else:
                data[mrt[1]] += 1
        for key, value in sorted(data.items(), key=lambda item: item[1], reverse=True):
            mrt_data.append(key)
        return JSONResponse(
            status_code=200,
            content={"data": mrt_data},
            media_type="application/json; charset=utf-8",
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"error": "ok", "message": str(Exception)},
            media_type="application/json; charset=utf-8",
        )
