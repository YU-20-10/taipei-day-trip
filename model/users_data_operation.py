import mysql.connector

from db_config import database


class Users_data_operation:
    def get_user_by_email(email):
        try:
            database_connect = database()
            database_connect_cursor = database_connect.cursor(dictionary=True)
            database_connect_cursor.execute(
                "SELECT email FROM users WHERE email=%s", [email]
            )
            email_check = database_connect_cursor.fetchone()
            return email_check
        except mysql.connector.Error as error:
            print("Error code:", error.errno)
            print("Error message:", error.msg)
        finally:
            if database_connect.is_connected():
                database_connect_cursor.close()
                database_connect.close()

    def get_user_by_email_and_passowrd(email, password):
        try:
            database_connect = database()
            database_connect_cursor = database_connect.cursor(dictionary=True)
            database_connect_cursor.execute(
                "SELECT id,name,email FROM users WHERE email=%s and password=%s",
                [email, password],
            )
            signin_check = database_connect_cursor.fetchone()
            return signin_check
        except mysql.connector.Error as error:
            print("Error code:", error.errno)
            print("Error message", error.msg)
        finally:
            if database_connect.is_connected():
                database_connect_cursor.close()
                database_connect.close()

    def insert_user_data(signup_form_data):
        try:
            database_connect = database()
            database_connect_cursor = database_connect.cursor(dictionary=True)
            database_connect_cursor.execute(
                "INSERT INTO users(name,email,password) VALUES (%s,%s,%s)",
                [
                    signup_form_data.name,
                    signup_form_data.email,
                    signup_form_data.password,
                ],
            )
            database_connect.commit()
            return True
        except mysql.connector.Error as error:
            print("Error code:", error.errno)
            print("Error message:", error.msg)
            return False
        finally:
            if database_connect.is_connected():
                database_connect_cursor.close()
                database_connect.close()
