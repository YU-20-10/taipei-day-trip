import json
import secrets
import os

from db_config import database


attrations_data = []
mrt_data = []

# with open("data/taipei-attractions.json", "r", encoding="utf-8") as row_attrations_data:
#     row_attrations_data_json = json.load(row_attrations_data)
#     for index, data in enumerate(row_attrations_data_json["result"]["results"]):
#         # 篩選圖片網址
#         images = []
#         for img in data["file"].split("https"):
#             if img and img.lower().endswith(("jpg", "png")):
#                 images.append("https" + img)

#         # 找出mrt對應的mrt_id,若mrt為null則mrt_id也為None
#         # 處理mysql mrt資料
#         mrt_id = None
#         if len(mrt_data) > 0:
#             dataExist = False
#             for mrt in mrt_data:
#                 if data["MRT"] == mrt["name"]:
#                     mrt_id = mrt["id"]
#                     dataExist = True
#                     break
#             if not dataExist and data["MRT"]:
#                 mrt_id = len(mrt_data) + 1
#                 mrt_data.append({"id": mrt_id, "name": data["MRT"]})
#         elif len(mrt_data) == 0 and data["MRT"]:
#             mrt_id = 1
#             mrt_data.append({"id": 1, "name": data["MRT"]})

#         # 處理mysql attraction資料
#         attrations_data.append(
#             {
#                 "id": len(attrations_data) + 1,
#                 "name": data["name"],
#                 "category": data["CAT"],
#                 "description": data["description"],
#                 "address": data["address"],
#                 "transport": data["direction"],
#                 "mrt_id": mrt_id,
#                 "lat": float(data["latitude"]),
#                 "lng": float(data["longitude"]),
#                 "images": json.dumps(images)
#             }
#         )

# print(attrations_data)
# print(mrt_data)

# taipei_trip
database_connect = database()
database_connect_cursor = database_connect.cursor()
# database_connect_cursor.execute("CREATE DATABASE taipei_trip")
# database_connect_cursor.execute("USE taipei_trip")

# table mrt
# database_connect_cursor.execute(
#     "CREATE TABLE mrt(id BIGINT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(255) NOT NULL)"
# )
# for mrt in mrt_data:
#     database_connect_cursor.execute(
#         "INSERT INTO mrt (id,name) VALUES (%s,%s)", [mrt["id"], mrt["name"]]
#     )
# database_connect.commit()

# table attrations
# database_connect_cursor.execute(
#     "CREATE TABLE attractions(id BIGINT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(255) NOT NULL,category VARCHAR(255) NOT NULL,description TEXT NOT NULL,address VARCHAR(255) NOT NULL,transport TEXT NOT NULL,mrt_id BIGINT,lat FLOAT NOT NULL,lng FLOAT NOT NULL,images TEXT,FOREIGN KEY(mrt_id) REFERENCES mrt(id))"
# )
# database_connect_cursor.execute("ALTER TABLE attractions MODIFY transport TEXT")
# for attration in attrations_data:
#     database_connect_cursor.execute("INSERT INTO attractions (id,name,category,description,address,transport,mrt_id,lat,lng,images) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",[attration["id"],attration["name"],attration["category"],attration["description"],attration["address"],attration["transport"],attration["mrt_id"],attration["lat"],attration["lng"],attration["images"]])

# database_connect_cursor.execute("SELECT * FROM attractions")
# result = database_connect_cursor.fetchall()
# for el in result:
#     print(el[0])

# table user
# database_connect_cursor.execute(
#     "CREATE TABLE users(id BIGINT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(255) NOT NULL,email VARCHAR(255) NOT NULL,password VARCHAR(255) NOT NULL,phone VARCHAR(255))"
# )
# database_connect_cursor.execute("INSERT INTO users (id,name,email,password) VALUES (%s,%s,%s,%s)",[1,"test","test@test.com","test"])

# table booking
# database_connect_cursor.execute(
#     "CREATE TABLE bookings(id BIGINT PRIMARY KEY AUTO_INCREMENT,user_id BIGINT NOT NULL,attraction_id BIGINT NOT NULL,date DATE NOT NULL,time VARCHAR(50) NOT NULL,price BIGINT UNSIGNED NOT NULL,FOREIGN KEY(user_id) REFERENCES users (id),FOREIGN KEY(attraction_id) REFERENCES attractions (id))"
# )
# database_connect_cursor.execute(
#     "INSERT INTO bookings(id,user_id,attraction_id,date,time,price) VALUES (1,1,1,'2025-04-08','morning',2000)"
# )
# database_connect_cursor.execute(
#     "ALTER TABLE bookings ADD UNIQUE (user_id)"
# )
# database_connect_cursor.execute(
#     "ALTER TABLE bookings ADD CONSTRAINT uq_user_id UNIQUE (user_id)"
# )
# database_connect_cursor.execute("SELECT user_id, COUNT(*) AS cnt FROM bookings GROUP BY user_id HAVING cnt > 1")
# data = database_connect_cursor.fetchall()
# print(data)

# table orders
database_connect_cursor.execute(
    "CREATE TABLE orders (number VARCHAR(20) PRIMARY KEY,user_id BIGINT NOT NULL,price BIGINT NOT NULL,trip TEXT,date DATE NOT NULL,time VARCHAR(50) NOT NULL,status TINYINT,pay_record VARCHAR(50),FOREIGN KEY (user_id) REFERENCES users(id))"
)

# database_connect_cursor.execute(
#     "ALTER TABLE orders MODIFY user_id BIGINT NOT NULL"
# )
# database_connect_cursor.execute(
#     "ALTER TABLE orders MODIFY booking_id BIGINT NOT NULL"
# )

# database_connect_cursor.execute(
#     "ALTER TABLE orders ADD pay_record VARCHAR(50)"
# )

database_connect.commit()
database_connect_cursor.close()
database_connect.close()

# key=secrets.token_hex(32)
# print(key)
