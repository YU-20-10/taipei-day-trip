import mysql.connector

from db_config import database


class Mrt_data_opertation:
    def get_mrt_data():
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
                if data.get(mrt[1], None) is None:
                    data[mrt[1]] = 1
                else:
                    data[mrt[1]] += 1
            for key, value in sorted(
                data.items(), key=lambda item: item[1], reverse=True
            ):
                mrt_data.append(key)
            return mrt_data
        except mysql.connector.Error as error:
            print("Error code:", error.errno)
            print("Error message:", error.msg)
