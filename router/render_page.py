from fastapi import APIRouter, Request
from fastapi.responses import FileResponse

render_router = APIRouter()


# Static Pages (Never Modify Code in this Block)
@render_router.get("/", include_in_schema=False)
async def index(request: Request):
    return FileResponse("./static/index.html", media_type="text/html")


@render_router.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
    return FileResponse("./static/attraction.html", media_type="text/html")


@render_router.get("/booking", include_in_schema=False)
async def booking(request: Request):
    return FileResponse("./static/booking.html", media_type="text/html")


@render_router.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
    return FileResponse("./static/thankyou.html", media_type="text/html")


@render_router.get("/membercenter", include_in_schema=False)
async def membercenter(request: Request):
    return FileResponse("./static/membercenter.html", media_type="text/html")
