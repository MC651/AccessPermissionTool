import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

class Database:
    def __init__(self):
        self.client: AsyncIOMotorClient | None = None
        self.db: AsyncIOMotorDatabase | None = None

    async def connect(self):
        """
        Enables Connection to Mongo DataBase in LocalHost
        Gets connection strings via Enviroment variables.

        """
        self.client = AsyncIOMotorClient(os.getenv("MONGODB_URI","mongodb://mongo:27017"))
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
