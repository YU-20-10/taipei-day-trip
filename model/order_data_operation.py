from fastapi.responses import JSONResponse
import mysql.connector
import json

from db_config import database


class order_data_operation:
    def insert_order_data(order_id, user_id, order_data):
        database_connect = None
        database_connect_cursor = None
        try:
            price = order_data["order"]["price"]
            trip = json.dumps(
                order_data["order"]["trip"]["attraction"], ensure_ascii=False
            )
            date = order_data["order"]["trip"]["date"]
            time = order_data["order"]["trip"]["time"]
            database_connect = database()
            database_connect_cursor = database_connect.cursor(dictionary=True)
            database_connect_cursor.execute(
                "INSERT INTO orders (number,user_id,price,trip,date,time,status) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                [order_id, user_id, price, trip, date, time, 1],
            )
            phone = order_data["contact"]["phone_number"]
            database_connect_cursor.execute(
                "UPDATE users SET phone=%s WHERE id=%s", [phone, user_id]
            )
            database_connect.commit()
        except mysql.connector.Error as error:
            print("error code", error.errno)
            print("error message", error.msg)
            return JSONResponse(
                status_code=400,
                content={
                    "error": True,
                    "message": "訂單建立失敗，輸入不正確或其他原因",
                },
                media_type="application/json",
            )
        finally:
            if database_connect and database_connect.is_connected():
                database_connect_cursor.close()
                database_connect.close()

    def update_pay_record(order_id, status, rec_trade_id):
        try:
            database_connect = database()
            database_connect_cursor = database_connect.cursor()
            if status == 0:
                database_connect_cursor.execute(
                    "UPDATE orders SET pay_record=%s,status=%s WHERE number=%s",
                    [rec_trade_id, status, order_id],
                )
            else:
                database_connect_cursor.execute(
                    "UPDATE orders SET pay_record=%s WHERE number=%s",
                    [rec_trade_id, order_id],
                )
            database_connect.commit()
        except mysql.connector.Error as error:
            print("Error code", error.errno)
            print("Error message", error.msg)
        finally:
            if database_connect.is_connected():
                database_connect_cursor.close()
                database_connect.close()

    def get_order_data(num):
        try:
            database_connect = database()
            database_connect_cursor = database_connect.cursor(dictionary=True)
            database_connect_cursor.execute(
                "SELECT price,trip,date,time,status,users.name,users.email,users.phone FROM orders INNER JOIN users ON orders.user_id=users.id WHERE orders.number=%s",
                [num],
            )
            result = database_connect_cursor.fetchone()
            return result
        except mysql.connector.Error as error:
            print("Error Code", error.errno)
            print("Error Message", error.msg)
        finally:
            if database_connect.is_connected():
                database_connect_cursor.close()
                database_connect.close()
