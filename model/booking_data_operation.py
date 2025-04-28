import mysql.connector


class Booking_data_operation:
    def get_booking_data(user_id, database_connect):
        database_connect_cursor = None
        try:
            database_connect_cursor = database_connect.cursor(dictionary=True)
            database_connect_cursor.execute(
                "SELECT attractions.id,attractions.name,attractions.address,attractions.images,date,time,price FROM bookings INNER JOIN attractions ON attraction_id=attractions.id WHERE user_id=%s",
                [user_id],
            )
            booking_data = database_connect_cursor.fetchone()
            return booking_data
        except mysql.connector.Error as error:
            print("Error code", error.errno)
            print("Error message", error.msg)
        finally:
            if database_connect_cursor:
                database_connect_cursor.close()

    def insert_booking_data(data, user_id, database_connect):
        database_connect_cursor = None
        try:
            database_connect_cursor = database_connect.cursor()
            database_connect_cursor.execute(
                "INSERT INTO bookings(attraction_id,user_id,date,time,price) VALUES (%s,%s,%s,%s,%s) ON DUPLICATE KEY UPDATE attraction_id=VALUES(attraction_id),user_id=VALUES(user_id),date=VALUES(date),time=VALUES(time),price=VALUES(price)",
                [data.attractionId, user_id, data.date, data.time, data.price],
            )
            database_connect.commit()
            return True
        except mysql.connector.Error as error:
            print("Error code", error.errno)
            print("Error message", error.msg)
            return False
        finally:
            if database_connect_cursor:
                database_connect_cursor.close()

    def delete_booking_data(user_id, database_connect):
        database_connect_cursor = None
        try:
            database_connect_cursor = database_connect.cursor()
            database_connect_cursor.execute(
                "DELETE FROM bookings WHERE user_id=%s", [user_id]
            )
            database_connect.commit()
            return True
        except mysql.connector.Error as error:
            print("Error code", error.errno)
            print("Error message", error.msg)
            return False
        finally:
            if database_connect_cursor:
                database_connect_cursor.close()
