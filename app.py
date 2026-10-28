from fastapi import FastAPI

import admin_topups_ui
import shop_api
import vodafone_topups
from db import Base, engine

Base.metadata.create_all(engine)  # للإنتاج: استبدلها بـ Alembic migrations
app = FastAPI(title="Shahn Sari3")
for module in (shop_api, vodafone_topups, admin_topups_ui):
    app.include_router(module.router)
