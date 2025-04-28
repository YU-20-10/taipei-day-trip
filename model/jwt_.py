import os
import jwt


class jwt_:
    def encode(data):
        key = os.getenv("JWT_SECRET_KEY")
        token = jwt.encode(data, key, algorithm="HS256")
        return token

    def decode(token):
        key = os.getenv("JWT_SECRET_KEY")
        data = jwt.decode(token, key, algorithms=["HS256"])
        return data
