# from fastapi import *
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import mysql.connector
import json

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


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
        # 使用INNER JOIN+UNION 篩選時包含mrt_id=None的對象
        if keyword:
            database_connect_cursor.execute(
                "SELECT attractions_id, attractions_name,category,description,address,transport, mrt_name,lat,lng,images FROM (SELECT attractions.id AS attractions_id,attractions.name AS attractions_name,attractions.category,attractions.description,attractions.address,attractions.transport,mrt.name AS mrt_name,attractions.lat,attractions.lng,attractions.images FROM attractions INNER JOIN mrt ON attractions.mrt_id=mrt.id UNION SELECT attractions.id AS attractions_id,attractions.name AS attractions_name,attractions.category,attractions.description,attractions.address,attractions.transport,NULL AS mrt_name,attractions.lat,attractions.lng,attractions.images FROM attractions WHERE attractions.mrt_id IS NULL) AS result WHERE mrt_name=%s OR attractions_name LIKE %s ORDER BY attractions_id LIMIT 13 OFFSET %s",
                [keyword, f"%{keyword}%", 12 * page],
            )
        else:
            # 使用LEFT JOIN，篩選時包含mrt_id=None的對象
            database_connect_cursor.execute(
                "SELECT attractions.id,attractions.name AS attractions_name,attractions.category,attractions.description,attractions.address,attractions.transport,mrt.name AS mrt_name,attractions.lat,attractions.lng,attractions.images FROM attractions LEFT JOIN mrt ON attractions.mrt_id=mrt.id ORDER BY attractions.id LIMIT 13 OFFSET %s",
                [12 * page],
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
        database_connect_cursor.close()
        database_connect.close()
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
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(e)},
            media_type="application/json; charset=utf-8",
        )


@app.get("/api/attraction/{attractionId}", response_class=JSONResponse)
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
