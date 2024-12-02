from pydantic import BaseModel,EmailStr,Field
from datetime import datetime
from typing import Optional

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
    
class AccessPermissionRequest(BaseModel):
    fiscal_code: str  # Agrega fiscal_code aquí
    po_number: list[str]
    access_permission: AccessPermission