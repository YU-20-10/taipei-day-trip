import mysql.connector


class Users_data_operation:
    def get_user_by_email(email, database_connect):
        database_connect_cursor = None
        try:
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
            if database_connect_cursor:
                database_connect_cursor.close()

    def get_user_by_email_and_passowrd(email, password, database_connect):
        database_connect_cursor = None
        try:
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
            if database_connect_cursor:
                database_connect_cursor.close()

    def insert_user_data(signup_form_data, database_connect):
        database_connect_cursor = None
        try:
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
            if database_connect_cursor:
                database_connect_cursor.close()

    def get_user_data_have_phone(id, database_connect):
        database_connect_cursor = None
        try:
            database_connect_cursor = database_connect.cursor(dictionary=True)
            database_connect_cursor.execute(
                "SELECT id,name,email,phone FROM users WHERE id=%s", [id]
            )
            user_data = database_connect_cursor.fetchone()
            return user_data
        except mysql.connector.Error as error:
            print("Error code:", error.errno)
            print("Error message:", error.msg)
        finally:
            if database_connect_cursor:
                database_connect_cursor.close()

    def update_user_data(user_data, database_connect):
        database_connect_cursor = None
        try:
            database_connect_cursor = database_connect.cursor(dictionary=True)
            database_connect_cursor.execute(
                "UPDATE users SET name=%s,email=%s,phone=%s WHERE id=%s",
                [
                    user_data["name"],
                    user_data["email"],
                    user_data["phone"],
                    user_data["id"],
                ],
            )
            database_connect.commit()
            return True
        except mysql.connector.Error as error:
            print("Error code:", error.errno)
            print("Error message:", error.msg)
            return False
        finally:
            if database_connect_cursor:
                database_connect_cursor.close()
