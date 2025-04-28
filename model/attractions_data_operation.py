import mysql.connector
import json


class Attractions_data_operation:
    def get_attractions_data(page, keyword, database_connect):
        database_connect_cursor = None
        try:
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
            data = database_connect_cursor.fetchall()
            return data
        except mysql.connector.Error as error:
            print("Error code:", error.errno)
            print("Error message:", error.msg)
        finally:
            if database_connect_cursor:
                database_connect_cursor.close()

    def get_attraction_by_id(attractionId, database_connect):
        attractions_data = {}
        database_connect_cursor = None
        try:
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
            return attractions_data
        except mysql.connector.Error as error:
            print("Error code:", error.errno)
            print("Error message:", error.msg)
        finally:
            if database_connect_cursor:
                database_connect_cursor.close()
