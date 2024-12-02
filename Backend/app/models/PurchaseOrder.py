from pydantic import BaseModel,EmailStr,Field
from datetime import datetime
from typing import Optional
from app.models.AccessPermission import AccessPermission
#from models.AccessPermission import AccessPermission

class Requester(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None




class Subapalto(BaseModel):
    subapalto_number: Optional[str] = None
    subapalto_status: Optional[str] = None

class PurchaseOrder(BaseModel):
    po_number: Optional[str] = None
    description: Optional[str] = None
    issue_date: Optional[datetime] = None
    validity_end_date : Optional[datetime] = None
    requester: Optional[Requester] = None
    locations: list[str] = Field(default_factory=list)
    duvri : Optional[bool] = None
    access_permission: Optional[list[AccessPermission]] = None
    subapalto : Optional[Subapalto] = None