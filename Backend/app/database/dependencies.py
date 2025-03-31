from fastapi import HTTPException
""" from app.dal.employees_dal import EmployeesDAL
from app.database.connection import database """
from dal.employees_dal import EmployeesDAL
from database.connection import database

async def get_employees_dal() -> EmployeesDAL:
    """
    Async function to access application Database
    """
    if database.db is None:
        raise HTTPException(status_code=500, detail="No connection to collection ")
    return EmployeesDAL(database.db)