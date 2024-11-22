from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from dal.employees_dal import EmployeesDAL
from fastapi import HTTPException

class Database:
    def __init__(self):
        self.client: AsyncIOMotorClient | None = None
        self.db: AsyncIOMotorDatabase | None = None

    async def connect(self):
        """
        Enables Connection to Mongo DataBase in LocalHost
        Gets connection strings via Enviroment variables.

        """
        self.client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
        self.db = self.client.application
        print("Connection to DB succesfull.")

    async def close(self):
        """
        Closes Connection to Mongo DataBase in LocalHost
        """
        if self.client:
            self.client.close()
            print("Connection to DB Closed.")

# Instance of DB Class
database = Database()


async def get_employees_dal() -> EmployeesDAL:
    """
    Async function to access application Database
    """
    if database.db is None:
        raise HTTPException(status_code=500, detail="No connection to collection ")
    return EmployeesDAL(database.db)