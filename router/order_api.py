from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Annotated
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import random
import string
import os
import requests
import json

import logging


from db_config import db_get_connection
from model.order_data_operation import Order_data_operation
from model.booking_data_operation import Booking_data_operation
from model.jwt_ import jwt_

order_api = APIRouter()

logger = logging.getLogger(__name__)

load_dotenv()


class Order_data(BaseModel):
    prime: str
    order: dict
    contact: dict


def create_order_id():
    tz = timezone(timedelta(hours=8))
    now = datetime.now(tz).strftime("%Y%m%d%H%M%S")
    random_num = "".join(random.choices(string.digits, k=4))
    return f"{now}{random_num}"


oauth2 = OAuth2PasswordBearer(tokenUrl="token")


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


@order_api.get("/api/orders/all", response_class=JSONResponse)
async def get_all_order(
    token: Annotated[str, Depends(token_validaotr)],
    database_connect=Depends(db_get_connection),
):
    try:
        user_data = jwt_.decode(token)
        all_order_data = Order_data_operation.get_all_order(
            user_data["id"], database_connect
        )
        for order in all_order_data:
            order["trip"] = json.loads(order["trip"])
            order["date"] = order["date"].isoformat()

        data = all_order_data

        return JSONResponse(
            status_code=200,
            content={"data": data},
            media_type="application/json;charset-utf-8",
        )

    except Exception as error:
        print(str(error))
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(error)},
            media_type="application/json;charset-utf-8",
        )


@order_api.get("/api/orders/{order_number}", response_class=JSONResponse)
async def get_order(
    token: Annotated[str, Depends(token_validaotr)],
    order_number: str,
    database_connect=Depends(db_get_connection),
):
    try:
        row_order_data = Order_data_operation.get_order_data(
            order_number, database_connect
        )
        order_data = None
        if row_order_data:
            trip = json.loads(row_order_data["trip"])
            trip["date"] = row_order_data["date"].isoformat()
            trip["time"] = row_order_data["time"]
            order_data = {
                "number": order_number,
                "price": row_order_data["price"],
                "trip": trip,
                "contact": {
                    "name": row_order_data["name"],
                    "email": row_order_data["email"],
                    "phone": row_order_data["phone"],
                },
                "status": row_order_data["status"],
            }

        return JSONResponse(
            status_code=200,
            content={"data": order_data},
            media_type="application/json;charset-utf-8",
        )

    except Exception as error:
        print(str(error))
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(error)},
            media_type="application/json;charset-utf-8",
        )


@order_api.post("/api/orders", response_class=JSONResponse)
async def post_order(
    token: Annotated[str, Depends(token_validaotr)],
    order_data_row: Order_data,
    database_connect=Depends(db_get_connection),
):
    try:
        order_id = create_order_id()
        user_data = jwt_.decode(token)

        # 資料字典化+符合TapPay的變數名稱
        order_data = order_data_row.model_dump()
        order_data["contact"]["phone_number"] = order_data["contact"].pop("phone")

        # 建立訂單
        Order_data_operation.insert_order_data(
            order_id, user_data["id"], order_data, database_connect
        )

        # 呼叫 TapPay 的 Pay By Prime API
        url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
        partner_key = os.getenv("Partner_Key")
        merchant_id = os.getenv("Merchant_Id")
        headers = {
            "Content-Type": "application/json",
            "x-api-key": partner_key,
        }

        data = {
            "prime": order_data["prime"],
            "partner_key": partner_key,
            "merchant_id": merchant_id,
            "details": f"台北一日遊導覽-{order_data['order']['trip']['attraction']['name']}",
            "amount": order_data["order"]["price"],
            "cardholder": order_data["contact"],
        }
        row_response = requests.post(url, headers=headers, json=data)
        response = row_response.json()

        # 依照response更新資料庫
        Order_data_operation.update_pay_record(
            order_id, response["status"], response["rec_trade_id"], database_connect
        )
        # 刪除booking資料
        Booking_data_operation.delete_booking_data(user_data["id"], database_connect)

        if response["status"] == 0:
            return JSONResponse(
                status_code=200,
                content={
                    "data": {
                        "number": order_id,
                        "payment": {"status": 0, "message": "付款成功"},
                    }
                },
                media_type="application/json; charset=utf-8",
            )
        else:
            return JSONResponse(
                status_code=200,
                content={
                    "data": {
                        "number": order_id,
                        "payment": {
                            "status": response["status"],
                            "message": f"付款失敗{response['msg']}",
                        },
                    }
                },
                media_type="application/json; charset=utf-8",
            )
    except Exception as error:
        print(str(error))
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(error)},
            media_type="application/json;charset-utf-8",
        )


@order_api.post("/api/orders/{order_number}", response_class=JSONResponse)
async def post_repay_order(
    order_number: str,
    token: Annotated[str, Depends(token_validaotr)],
    order_data_row: Order_data,
    database_connect=Depends(db_get_connection),
):
    try:
        # 資料字典化+符合TapPay的變數名稱
        order_data = order_data_row.model_dump()
        order_data["contact"]["phone_number"] = order_data["contact"].pop("phone")
        print(order_data)

        # 呼叫 TapPay 的 Pay By Prime API
        url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
        partner_key = os.getenv("Partner_Key")
        merchant_id = os.getenv("Merchant_Id")
        headers = {
            "Content-Type": "application/json",
            "x-api-key": partner_key,
        }

        data = {
            "prime": order_data["prime"],
            "partner_key": partner_key,
            "merchant_id": merchant_id,
            "details": f"台北一日遊導覽-{order_data['order']['trip']['attraction']['name']}",
            "amount": order_data["order"]["price"],
            "cardholder": order_data["contact"],
        }
        row_response = requests.post(url, headers=headers, json=data)
        response = row_response.json()

        # 依照response更新資料庫
        Order_data_operation.update_pay_record(
            order_number, response["status"], response["rec_trade_id"], database_connect
        )

        if response["status"] == 0:
            return JSONResponse(
                status_code=200,
                content={
                    "data": {
                        "number": order_number,
                        "payment": {"status": 0, "message": "付款成功"},
                    }
                },
                media_type="application/json; charset=utf-8",
            )
        else:
            return JSONResponse(
                status_code=200,
                content={
                    "data": {
                        "number": order_number,
                        "payment": {
                            "status": response["status"],
                            "message": f"付款失敗{response['msg']}",
                        },
                    }
                },
                media_type="application/json; charset=utf-8",
            )
    except Exception as error:
        print(str(error))
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": str(error)},
            media_type="application/json;charset-utf-8",
        )
