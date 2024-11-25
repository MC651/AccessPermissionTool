
from pydantic import BaseModel,EmailStr,Field
from datetime import datetime
from typing import Optional

"""
Pydantic models used to define the structure of the data input
also is used for data validation improvees and optimize the logic of the querys
and methods
"""
class UserCredentials(BaseModel):
    user_type : str = Field(default='user') 
    email : EmailStr
    password : Optional[str] 
    user_name: str

class Requester(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class AccessPermission(BaseModel):
    protocol_number: Optional[str] = None
    plant: Optional[str] = None
    status: Optional[str] = None
    validity_end_date: Optional[datetime] = None
    address: Optional[str] = None
    gates: Optional[list[int]] = Field(default_factory=list)

    @staticmethod
    def to_dict(access_permission: 'AccessPermission') -> dict:
        """
        Converts an AccessPermission instance to a dictionary.
        Args:
            access_permission (AccessPermission): The AccessPermission instance to be converted.

        Returns:
            dict: The dictionary representation of the AccessPermission instance.
        
        """
        return {
            "protocol_number": access_permission.protocol_number,
            "plant": access_permission.plant,
            "status": access_permission.status,
            "validity_end_date": access_permission.validity_end_date,
            "address": access_permission.address,
            "gates": access_permission.gates
        }

    @staticmethod
    def list_to_dict(access_permissions: list['AccessPermission']) -> list[dict]:
        """
        Converts a list of AccessPermission instances to a list of dictionaries.
        Args:
            access_permissions (list[AccessPermission]): The list of AccessPermission instances to be converted.

        Returns:
            list[dict]: The list of dictionaries representation of the AccessPermission instances.
        
        """
        return [AccessPermission.to_dict(ap) for ap in access_permissions]


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
class Person(BaseModel):
    _id: Optional[str]
    first_name: str
    last_name: str
    fiscal_code: str
    birth_date: datetime
    id_card_end_date:datetime
    contract_type:str
    contract_validity_start_date: datetime
    contract_validity_end_date: datetime
    visa_start_date:datetime
    visa_end_date:datetime
    user_credentials : UserCredentials
    #purchase_order: Optional[list[PurchaseOrder]] = Field(default_factory=  lambda: [PurchaseOrder()])
    purchase_order: Optional[list[PurchaseOrder]]
    profile_image_path: Optional[str] = None
    id_card_path: Optional[str] = None
    visa_path: Optional[str] = None
    unilav_path: Optional[str] = None
    
    # Static methods are used to deserealize the mongoDB document into
    # a (Python) Person instace 
    @staticmethod
    def from_doc(doc) -> "Person":
        """
        Returns a Person instance from a MongoDB document.
        Args:
            doc (dict): The MongoDB document to be deserialized.

        Returns:
            Person: The Person instance.
        """
        return Person(
            id=str(doc["_id"]),
            first_name=doc["first_name"],
            last_name=doc["last_name"],
            fiscal_code=doc["fiscal_code"],
            birth_date=doc["birth_date"],
            id_card_end_date=doc["id_card_end_date"],
            contract_type=doc["contract_type"],
            contract_validity_start_date=doc["contract_validity_start_date"],
            contract_validity_end_date=doc["contract_validity_end_date"],
            visa_start_date=doc["visa_start_date"],
            visa_end_date=doc["visa_end_date"],
            user_credentials=doc["user_credentials"],
            purchase_order=doc["purchase_order"],
            profile_image_path=doc["profile_image_path"],
            id_card_path=doc["id_card_path"],
            visa_path=doc["visa_path"],
            unilav_path=doc["unilav_path"]
            
        )

class Token(BaseModel):
    access_token: str
    us:str
    fs:str
    ut:str
    token_type: str

class FilteredEmployee(BaseModel):
    first_name:str
    last_name:str
    fiscal_code: str
    contract_validity_start_date: datetime
    contract_validity_end_date: datetime
    purchase_order: list[PurchaseOrder]


    @staticmethod
    def from_doc(doc) -> "FilteredEmployee":
        """
        Returns a FilteredEmployee instance from a MongoDB document.
        Args:
            doc (dict): The MongoDB document to be deserialized.

        Returns:
            FilteredEmployee: The FilteredEmployee instance.
        """
        return FilteredEmployee(
            first_name=doc["first_name"],
            last_name=doc["last_name"],
            fiscal_code=doc["fiscal_code"],
            contract_validity_start_date=doc["contract_validity_start_date"],
            contract_validity_end_date=doc["contract_validity_end_date"],
            purchase_order=doc["purchase_order"]    
        )
    
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
class AccessPermissionRequest(BaseModel):
    fiscal_code: str  # Agrega fiscal_code aquí
    po_number: list[str]
    access_permission: AccessPermission




    
