from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer

from typing import Annotated
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import date
import os
import jwt
import json

from model.booking_data_operation import Booking_data_operation

booking_api = APIRouter()

load_dotenv()

oauth2 = OAuth2PasswordBearer(tokenUrl="token")


class Booking_form_data(BaseModel):
    attractionId: int
    date: date
    time: str
    price: int


def format_error_to_json(message: dict):
    return message


class CustomOauthExpection(HTTPException):
    def __init__(self, status_code, message: dict):
        super().__init__(status_code, detail=format_error_to_json(message))


async def token_validaotr(token: Annotated[str, Depends(oauth2)]):
    if token == "null":
        raise CustomOauthExpection(
            403, {"error": True, "message": "未登入或是登入驗證已過期，請重新登入"}
        )
    return token


@booking_api.get("/api/booking", response_class=JSONResponse)
async def get_booking(token: Annotated[str, Depends(token_validaotr)]):
    try:
        key = os.getenv("JWT_SECRET_KEY")
        user_data = jwt.decode(token, key, algorithms=["HS256"])
        row_booking_data = Booking_data_operation.get_booking_data(user_data["id"])
        if row_booking_data:
            booking_data = {
                "attraction": {
                    "id": row_booking_data["id"],
                    "name": row_booking_data["name"],
                    "address": row_booking_data["address"],
                    "image": json.loads(row_booking_data["images"])[0],
                },
                "date": row_booking_data["date"].isoformat(),
                "time": row_booking_data["time"],
                "price": row_booking_data["price"],
            }

        else:
            booking_data = None
        return JSONResponse(
            status_code=200,
            content={"data": booking_data},
            media_type="application/json; charset=utf-8",
        )
    except Exception as e:
        print(str(e))
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(e)},
            media_type="application/json; charset=utf-8",
        )


@booking_api.post("/api/booking", response_class=JSONResponse)
async def post_booking(
    token: Annotated[str, Depends(token_validaotr)],
    booking_form_data: Booking_form_data,
):
    try:
        key = os.getenv("JWT_SECRET_KEY")
        user_data = jwt.decode(token, key, algorithms="HS256")
        insert_result = Booking_data_operation.insert_booking_data(
            booking_form_data, user_data["id"]
        )
        if insert_result:
            return JSONResponse(
                status_code=200,
                content={"ok": True},
                media_type="application/json; charset=utf-8",
            )
        else:
            return JSONResponse(
                status_code=400,
                content={"error": True, "message": "資料庫錯誤"},
                media_type="application/json; charset=utf-8",
            )
    except Exception as e:
        print(str(e))
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(e)},
            media_type="application/json; charset=utf-8",
        )


@booking_api.delete("/api/booking", response_class=JSONResponse)
async def delete_booking_data(token: Annotated[str, Depends(token_validaotr)]):
    try:
        key = os.getenv("JWT_SECRET_KEY")
        user_data = jwt.decode(token, key, algorithms="HS256")
        delete_result = Booking_data_operation.delete_booking_data(user_data["id"])
        if delete_result:
            return JSONResponse(
                status_code=200,
                content={"ok": True},
                media_type="application/json; charset=utf-8",
            )
        else:
            return JSONResponse(
                status_code=400,
                content={"error": True, "message": "資料庫錯誤"},
                media_type="application/json; charset=utf-8",
            )
    except Exception as e:
        print(str(e))
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(e)},
            media_type="application/json; charset=utf-8",
        )
