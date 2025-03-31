from pydantic import BaseModel,EmailStr,Field
from datetime import datetime
from typing import Optional
from app.models.PurchaseOrder import PurchaseOrder
#from models.PurchaseOrder import PurchaseOrder

class UserCredentials(BaseModel):
    user_type : str = Field(default='user') 
    email : EmailStr
    password : Optional[str] 
    user_name: str

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
    visa_start_date: Optional[datetime] | None = Field(default=None)
    visa_end_date: Optional[datetime] | None = Field(default=None)
    user_credentials : UserCredentials
    purchase_order: Optional[list[PurchaseOrder]]
    parent_folder_id : Optional[str] = Field(default=None)
    profile_image_path: Optional[str] = None
    id_card_path: Optional[str] = None
    visa_path: Optional[str] = Field(default=None)
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
            parent_folder_id = doc["parent_folder_id"],
            profile_image_path=doc["profile_image_path"],
            id_card_path=doc["id_card_path"],
            visa_path=doc["visa_path"],
            unilav_path=doc["unilav_path"]     
        )