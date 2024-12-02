from pydantic import BaseModel,EmailStr
from datetime import datetime
from typing import Optional

class ModifiedUserCredentials(BaseModel):
    email : Optional[EmailStr] = None
    password : Optional[str] = None
    user_type : Optional[str] = None
    user_name: Optional[str] = None
    
class ModifiedEmployee(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str]=None
    birth_date: Optional[datetime]=None
    id_card_end_date:Optional[datetime]=None
    contract_type:Optional[str]=None
    contract_validity_start_date: Optional[datetime]=None
    contract_validity_end_date: Optional[datetime]=None
    visa_start_date:Optional[datetime]=None
    visa_end_date:Optional[datetime]=None
    user_credentials : Optional[ModifiedUserCredentials] = None