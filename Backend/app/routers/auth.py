from typing import Annotated
import jwt
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
from app.dal.employees_dal import EmployeesDAL
from app.database.dependencies import get_employees_dal

""" from dal.employees_dal import EmployeesDAL
from database.dependencies import get_employees_dal """

#Create OAuth2PasswordBearer scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

"""
Login & Authentication

"""

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """
    Creates an access token from a dictionary which includes the user's data and an expiration delta.

    Args:
        data (dict): The data to be encoded in the access token.
        expires_delta (timedelta | None): The expiration delta for the access token.

    Returns:
        str: The encoded access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))
    return encoded_jwt

async def get_current_user(token:Annotated[str,Depends(oauth2_scheme)],
                         usr_dal: EmployeesDAL = Depends(get_employees_dal)):
    """
    Retrieves the current user from the access token.

    Args:
        token (Annotated[str, Depends(oauth2_scheme)]): The access token.
        usr_dal (EmployeesDAL): The employees DAL.

    Returns:
        Person: The current user.
    """
    credentials_exeception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                               detail="Could not valdidate credentials",
                                               headers={"WWW-Authenticate":"Bearer"})
    try:
        payload = jwt.decode(token,os.getenv("SECRET_KEY"),algorithms=[os.getenv("ALGORITHM")])
        #print(f"Payload: {payload}")
        user_name: str = payload.get('us')
        user_type: str = payload.get('ut')
        #print(f"User Name from validate_token: {user_name}")
        #print(f"User Type from validate_token: {user_type}")
        if user_name is None:
            raise credentials_exeception
        user = await usr_dal.find_user_name(user_name)
        #print(f"User From Valid Token {user}")
    except InvalidTokenError:
        raise credentials_exeception
    return user