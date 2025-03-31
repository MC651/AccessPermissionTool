from fastapi import FastAPI,HTTPException
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
#Load environment variables
load_dotenv()

""" from app.routers import routes
from app.database.connection import database """

from routers import routes
from database.connection import database

# Application instance which creates the server
app = FastAPI()

# Origins that are allowed to access the application
origins = [
    "http://localhost:5173",
    "http://localhost:5172",
    os.getenv("REACT_URL")
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


