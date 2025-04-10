from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import timezone
import jwt
import os
import datetime

from model.users_data_operation import Users_data_operation

load_dotenv()

user_api = APIRouter()


class signin_form_data(BaseModel):
    email: str
    password: str


class signup_form_data(BaseModel):
    name: str
    email: str
    password: str


outh2 = OAuth2PasswordBearer(tokenUrl="token")


@user_api.post("/api/user", response_class=JSONResponse)
async def user_signup(signup_form_data: signup_form_data):
    try:
        email_check = Users_data_operation.get_user_by_email(signup_form_data.email)
        if email_check:
            return JSONResponse(
                status_code=400,
                content={"error": True, "message": "此信箱已被註冊"},
                media_type="application/json; charset=utf-8",
            )
        Users_data_operation.insert_user_data(signup_form_data)
        return JSONResponse(
            status_code=200,
            content={"ok": True},
            media_type="application/json; charset=utf-8",
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(Exception)},
            media_type="application/json; charset=utf-8",
        )


@user_api.put("/api/user/auth", response_class=JSONResponse)
async def user_signin(signin_form_data: signin_form_data):
    try:
        signin_check = Users_data_operation.get_user_by_email_and_passowrd(
            signin_form_data.email, signin_form_data.password
        )
        if signin_check:
            signin_check["exp"] = datetime.datetime.now(
                tz=timezone.utc
            ) + datetime.timedelta(days=7)
            key = os.getenv("JWT_SECRET_KEY")
            token = jwt.encode(signin_check, key, algorithm="HS256")
            return JSONResponse(
                status_code=200,
                content={"token": token},
                media_type="application/json; charset=utf-8",
            )
        else:
            return JSONResponse(
                status_code=400, content={"error": True, "message": "信箱或是密碼錯誤"}
            )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(Exception)},
            media_type="application/json; charset=utf-8",
        )


@user_api.get("/api/user/auth", response_class=JSONResponse)
async def user_status(token: str = Depends(outh2)):
    try:
        key = os.getenv("JWT_SECRET_KEY")
        data = jwt.decode(token, key, algorithms=["HS256"])
        del data["exp"]
        return JSONResponse(
            status_code=200,
            content={"data": data},
            media_type="application/json; charset=utf-8",
        )
    except Exception:
        print(str(Exception))
        return JSONResponse(status_code=200, content=None)
