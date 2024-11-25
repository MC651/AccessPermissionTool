from fastapi import FastAPI,HTTPException
from routers import routes
from database import Database
from contextlib import asynccontextmanager
from database import database
from fastapi.middleware.cors import CORSMiddleware

# Application instance which creates the server
app = FastAPI()

# Origins that are allowed to access the application
origins = [
    "http://localhost:5173",
    "http://localhost:5172",

]

# Assigment of the routers to the main app & the lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context to manage the database connection in the life cycle of the app.
    """
    await database.connect()

    yield

    await database.close()
#Lifespan of application
app = FastAPI(lifespan=lifespan)

#Router added to the application
app.include_router(routes.router)

#Middleware to allow CORS to don't block communication with external URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


