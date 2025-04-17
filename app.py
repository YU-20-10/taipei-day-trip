from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles


from router.render_page import render_router
from router.attraction_api import attraction_api
from router.mrt_api import mrt_api
from router.user_api import user_api
from router.booking_api import booking_api, CustomOauthExpection
from router.order_api import order_api

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(render_router)
app.include_router(attraction_api)
app.include_router(mrt_api)
app.include_router(user_api)
app.include_router(booking_api)
app.include_router(order_api)


@app.exception_handler(CustomOauthExpection)
async def custom_oauth_exception_handler(
    request: Request, cus_except: CustomOauthExpection
):
    return JSONResponse(
        status_code=cus_except.status_code,
        content=cus_except.detail,
        media_type="application/json; charset=utf-8",
    )
