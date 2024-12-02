from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    us:str
    fs:str
    ut:str
    token_type: str