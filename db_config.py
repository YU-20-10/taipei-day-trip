from dotenv import load_dotenv
from mysql.connector import pooling
import mysql.connector
import os

load_dotenv()

# def database():
#     return mysql.connector.connect(
#         host=os.getenv("DB_HOST"),
#         user=os.getenv("DB_USER"),
#         password=os.getenv("DB_PASSWORD"),
#         database=os.getenv("DB_NAME"),
#     )

db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name="taipei_day_trip_pool",
    pool_size=int(os.getenv("DB_POOL_SIZE")),
    **db_config,
)


def db_get_connection():
    database_connect = connection_pool.get_connection()
    try:
        yield database_connect
    finally:
        database_connect.close()
