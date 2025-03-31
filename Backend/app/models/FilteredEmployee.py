from pydantic import BaseModel
from datetime import datetime
#from app.models.PurchaseOrder import PurchaseOrder
from models.PurchaseOrder import PurchaseOrder

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