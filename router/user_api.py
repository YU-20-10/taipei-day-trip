from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import timezone
import datetime

from db_config import db_get_connection
from model.users_data_operation import Users_data_operation
from model.jwt_ import jwt_

load_dotenv()

user_api = APIRouter()


class signin_form_data(BaseModel):
    email: str
    password: str


class signup_form_data(BaseModel):
    name: str
    email: str
    password: str


class Edit_form_data(BaseModel):
    memberCenterName: str
    memberCenterEmail: str
    memberCenterPhone: str


outh2 = OAuth2PasswordBearer(tokenUrl="token")


@user_api.post("/api/user", response_class=JSONResponse)
async def user_signup(
    signup_form_data: signup_form_data, database_connect=Depends(db_get_connection)
):
    try:
        email_check = Users_data_operation.get_user_by_email(
            signup_form_data.email, database_connect
        )
        if email_check:
            return JSONResponse(
                status_code=400,
                content={"error": True, "message": "此信箱已被註冊"},
                media_type="application/json; charset=utf-8",
            )
        Users_data_operation.insert_user_data(signup_form_data, database_connect)
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
async def user_signin(
    signin_form_data: signin_form_data, database_connect=Depends(db_get_connection)
):
    try:
        signin_check = Users_data_operation.get_user_by_email_and_passowrd(
            signin_form_data.email, signin_form_data.password, database_connect
        )
        if signin_check:
            signin_check["exp"] = datetime.datetime.now(
                tz=timezone.utc
            ) + datetime.timedelta(days=7)
            token = jwt_.encode(signin_check)
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
async def user_status(
    token: str = Depends(outh2), database_connect=Depends(db_get_connection)
):
    try:
        data = jwt_.decode(token)
        user_data = Users_data_operation.get_user_data_have_phone(
            data["id"], database_connect
        )
        return JSONResponse(
            status_code=200,
            content={"data": user_data},
            media_type="application/json; charset=utf-8",
        )
    except Exception:
        print(str(Exception))
        return JSONResponse(status_code=200, content=None)


@user_api.put("/api/user/edit", response_class=JSONResponse)
async def edit_user_data(
    edit_form_data: Edit_form_data,
    token: str = Depends(outh2),
    database_connect=Depends(db_get_connection),
):
    try:
        old_user_data = jwt_.decode(token)
        user_data = {
            "id": old_user_data["id"],
            "name": edit_form_data.memberCenterName,
            "email": edit_form_data.memberCenterEmail,
            "phone": edit_form_data.memberCenterPhone,
        }
        result = Users_data_operation.update_user_data(user_data, database_connect)
        if result:
            return JSONResponse(
                status_code=200,
                content={"data": {"ok": True}},
                media_type="application/json; charset=utf-8",
            )
        else:
            return JSONResponse(
                status_code=200,
                content={"data": {"ok": False}},
                media_type="application/json; charset=utf-8",
            )
    except Exception:
        print(str(Exception))
        return JSONResponse(
            status_code=500,
            content={"data": {"ok": False}},
            media_type="application/json; charset=utf-8",
        )
