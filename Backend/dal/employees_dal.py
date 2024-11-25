from fastapi import HTTPException,status,File,UploadFile
from models.models import AccessPermission, ModifiedEmployee, Person,PurchaseOrder,FilteredEmployee
from datetime import datetime
from pydantic import EmailStr
from passlib.context import CryptContext
from pymongo.errors import DuplicateKeyError
import json

#Password Context for hashing algorithm bcrypt
pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")

class EmployeesDAL:
    """
    Data Acces Layer (Querys logic to database via Async Mongo DB Driver "Motor")
    """
    def __init__(self, db):
        # Collection selected "Employees"
        self._db_collection = db.employees
    """
    FIND methods
    """
    async def list_employees(self, fiscal_code: str) -> Person:
        """
        Returns a Person instance from the database based on the fiscal code.
        Args:
            fiscal_code (str): The fiscal code of the employee.

        Returns:
            Person: The Person instance.
        """
        document = await self._db_collection.find_one({"fiscal_code": fiscal_code})
        if not document:
            raise HTTPException(status_code=404, detail="Employee not found")
        return document
        
    async def get_all(self):
        """
        Retrieves all employees filtered from the database 

        Returns:
            AsyncGenerator[FilteredEmployee, None, None]: An asynchronous generator that yields FilteredEmployee instances.
        """

        async for doc in self._db_collection.find({},
                                                    projection={
                                                        "_id": 0,
                                                        "user_credentials": 0,
                                                        "birth_date": 0,
                                                        "id_card_end_date": 0,
                                                        "contract_type": 0,
                                                        "visa_start_date": 0,
                                                        "visa_end_date": 0,
                                                        "profile_image_path": 0,
                                                        "id_card_path": 0,
                                                        "visa_path": 0,
                                                        "unilav_path": 0
                                                    },
                                                    sort={"first_name": 1}):
            
            yield FilteredEmployee.from_doc(doc)
    
    async def find_user_name(self,user_name:str)-> Person:
        """
        Returns a Person instance from the database based on the user name.
        Args:
            user_name (str): The user name of the employee.

        Returns:
            Person: The Person instance.
        """
        document = await self._db_collection.find_one({"user_credentials.user_name": user_name},)
        if not document:
            raise HTTPException(status_code=404, detail="User not found")
        return Person.from_doc(document)

    
    async def email_password_verification(self,user_name:str,
                                          typed_password:str):
        """
        Verifies the email and password of an employee.
        Args:
            user_name (str): The user name of the employee.
            typed_password (str): The typed password of the employee.

        Returns:
            Person: The Person instance.
        """
        user = await self._db_collection.find_one({"user_credentials.user_name":user_name})
        if user is not None:                   
            hashed_password = user["user_credentials"]["password"]
            is_valid_password = await self.check_hassh(typed_password,hashed_password)
            if not is_valid_password:
                raise HTTPException(status_code=400, detail="Incorrect Password")
            return user
        else:
            raise HTTPException(status_code=400, detail="User Name doesn't exist, register now!")
           
    
    async def check_hassh(self,typed_password:str,
                              hashed_password:str):
        """
        Checks if the typed password matches the hashed password.
        Args:
            typed_password (str): The typed password.
            hashed_password (str): The hashed password.

        Returns:
            bool: True if the typed password matches the hashed password, False otherwise.
        """
        return pwd_context.verify(typed_password,hashed_password)
    
    async def hash_password(self,password:str):
        """
        Hashes the password using the bcrypt algorithm.
        Args:
            password (str): The password to be hashed.

        Returns:
            str: The hashed password.
        """
        return pwd_context.hash(password)
    
    """
    INSERT methods
    """
    async def create_employee(self,
                              first_name:str,
                              last_name:str,
                              user_name:str,
                              fiscal_code:str,
                              birth_date:datetime,
                              id_card_end_date:datetime,
                              contract_type:str,
                              contract_validity_start_date:datetime,
                              contract_validity_end_date:datetime,
                              visa_start_date:datetime,
                              visa_end_date:datetime,
                              email:EmailStr,
                              password:str,
                              purchase_order:list,
                              profile_image_path:str,
                              id_card_path:str,
                              visa_path:str,
                              unilav_path:str,
                              user_type:str = 'user'
                              ):
        """
        Creates a new employee in the database.
        Args:
            first_name (str): The first name of the employee.
            last_name (str): The last name of the employee.
            fiscal_code (str): The fiscal code of the employee.
            birth_date (datetime): The birth date of the employee.
            id_card_end_date (datetime): The end date of the employee's ID card.
            contract_type (str): The type of contract the employee has.
            contract_validity_start_date (datetime): The start date of the contract validity.
            contract_validity_end_date (datetime): The end date of the contract validity.
            visa_start_date (datetime): The start date of the employee's visa.
            visa_end_date (datetime): The end date of the employee's visa.
            email (EmailStr): The email address of the employee.
            password (str): The password of the employee.
            purchase_order (list): The purchase order of the employee.
            profile_image_path (str): The path of the employee's profile image.
            id_card_path (str): The path of the employee's ID card.
            visa_path (str): The path of the employee's visa.
            unilav_path (str): The path of the employee's unilav.
            user_type (str): The type of user (default is 'user').

        Returns:        
            dict: A dictionary containing a message indicating the success or failure of the operation.

        """
        try: 
            new = await self._db_collection.insert_one(
                {"first_name":first_name,
                "last_name":last_name,
                "fiscal_code":fiscal_code,
                "birth_date":birth_date,
                "id_card_end_date":id_card_end_date,
                "contract_type":contract_type,
                "contract_validity_start_date":contract_validity_start_date,
                "contract_validity_end_date":contract_validity_end_date,
                "visa_start_date":visa_start_date,
                "visa_end_date":visa_end_date,
                "user_credentials" :{
                    "email":email,
                    "password": await self.hash_password(password),
                    "user_type": user_type,
                    "user_name": user_name
                    },
                "purchase_order":purchase_order,
                "profile_image_path":profile_image_path,
                "id_card_path":id_card_path,
                "visa_path":visa_path,
                "unilav_path":unilav_path
        
                }
            )
            #print(new)
            if not new:
                raise HTTPException(status_code=400, detail="Error trying to insert employee")
            return new
    
        except DuplicateKeyError as e:
            print(e)

            if "user_credentials.user_name" in e.details["errmsg"]:
                raise HTTPException(status_code=400, detail=f"User name: {user_name } already in use")
            
            elif "fiscal_code" in e.details["errmsg"]:
                
                raise HTTPException(status_code=400, detail=f"Fiscal code: {fiscal_code} already exists")
            
            elif "user_credentials.email" in e.details["errmsg"]:
                
                raise HTTPException(status_code=400, detail=f"Email: {email} already in use")
    
    async def create_purchase_order(self,
                                    fiscal_codes:list[str],
                                    po_number:str,
                                    description:str,
                                    issue_date:datetime,
                                    validity_end_date:datetime,
                                    duvri:bool,
                                    requester_first_name:str,
                                    requester_last_name:str,
                                    requester_email:str,
                                    locations:list[str],
                                    subapalto_number:str,
                                    subapalto_status:str,
                                    access_permission:list[AccessPermission],
                                    ):
        """
        Creates a purchase order in the database.
        Args:
            fiscal_codes (list[str]): The fiscal codes of the employees involved in the purchase order.
            po_number (str): The purchase order number.
            description (str): The description of the purchase order.
            issue_date (datetime): The issue date of the purchase order.
            validity_end_date (datetime): The end date of the purchase order's validity.
            duvri (bool): Whether the purchase order is duvri or not.
            requester_first_name (str): The first name of the requester.
            requester_last_name (str): The last name of the requester.
            requester_email (str): The email address of the requester.
            locations (list[str]): The locations of the purchase order.
            subapalto_number (str): The subapalto number of the purchase order.
            subapalto_status (str): The subapalto status of the purchase order.
            access_permission (list[AccessPermission]): The access permissions of the purchase order.

        Returns:
            dict: A dictionary containing a message indicating the success or failure of the operation.
        """

        if len(access_permission) == 0:
            access_permission_dicts = []
        else:
            access_permission_dicts = AccessPermission.list_to_dict(access_permission)
        
        purchase_order = await self._db_collection.update_many(
            {"fiscal_code": {"$in": fiscal_codes}},
            {"$push": {
                "purchase_order": {
                    "po_number": po_number,
                    "description": description,
                    "issue_date": issue_date,
                    "validity_end_date": validity_end_date,
                    "duvri": duvri,
                    "requester": {
                        "first_name": requester_first_name,
                        "last_name": requester_last_name,
                        "email": requester_email
                    },
                    "locations": locations,
                    "subapalto": {
                        "subapalto_number": subapalto_number,
                        "subapalto_status": subapalto_status
                    },
                    "access_permission": access_permission_dicts}}}
        )
        
        if purchase_order.raw_result["nModified"]  <= 0:
            raise HTTPException(status_code=40, detail="Error trying to insert purchase order")
        
        return purchase_order
        

    async def insert_purchase_order(self,
                                fiscal_code: str,
                                po_number: str,
                                description: str,
                                issue_date: datetime,
                                validity_end_date: datetime,
                                duvri: bool,
                                requester_first_name: str,
                                requester_last_name: str,
                                requester_email: str,
                                locations: list[str],
                                subapalto_number: str,
                                subapalto_status: str,
                                access_permission: list[AccessPermission]
                                ):
        """
        Inserts a purchase order in a employee's purchase order list if it doesn't already exist.
        Args:
            fiscal_code (str): The fiscal code of the employee.
            po_number (str): The purchase order number.
            description (str): The description of the purchase order.
            issue_date (datetime): The issue date of the purchase order.
            validity_end_date (datetime): The end date of the purchase order's validity.
            duvri (bool): Whether the purchase order is duvri or not.
            requester_first_name (str): The first name of the requester.
            requester_last_name (str): The last name of the requester.
            requester_email (str): The email address of the requester.
            locations (list[str]): The locations of the purchase order.
            subapalto_number (str): The subapalto number of the purchase order.
            subapalto_status (str): The subapalto status of the purchase order.
            access_permission (list[AccessPermission]): The access permissions of the purchase order.

        Returns:
            dict: A dictionary containing a message indicating the success or failure of the operation.
        """
    
        employee = await self._db_collection.find_one({"fiscal_code": fiscal_code})

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail=f"Employee with fiscal code: {fiscal_code} not found"
            )

        # Verificar si el po_number ya está en purchase_order del empleado
        if any(po["po_number"] == po_number for po in employee.get("purchase_order", [])):
            raise HTTPException(
                status_code=409,
                detail=f"Employee with fiscal code: {fiscal_code} already has PO: {po_number}"
            )

        # Si el fiscal_code existe y no tiene el po_number, agregar la nueva PO
        purchase_order = await self.create_purchase_order(
            fiscal_codes=[fiscal_code],
            po_number=po_number,
            description=description,
            issue_date=issue_date,
            validity_end_date=validity_end_date,
            duvri=duvri,
            requester_first_name=requester_first_name,
            requester_last_name=requester_last_name,
            requester_email=requester_email,
            locations=locations,
            subapalto_number=subapalto_number,
            subapalto_status=subapalto_status,
            access_permission=access_permission
        )

        return purchase_order
    
    async def insert_access_permission(self,
                                       fiscal_code:str,
                                       po_number:list[str],
                                       protocol_number:str,
                                       plant:str,
                                       status:str,
                                       validity_end_date:datetime,
                                       address:str,
                                       gates:list[int]
                                       ):
        
        """
        Inserts an access permission in a purchase order that already exists.
        Args:
            fiscal_code (str): The fiscal code of the employee.
            po_number (list[str]): The purchase order numbers of the purchase orders to be updated.
            protocol_number (str): The protocol number of the access permission.
            plant (str): The plant of the access permission.
            status (str): The status of the access permission.
            validity_end_date (datetime): The end date of the access permission's validity.
            address (str): The address of the access permission.
            gates (list[int]): The gates of the access permission.

        Returns:
            dict: A dictionary containing a message indicating the success or failure of the operation.
        """

        create_access_permission = await self._db_collection.update_many(
            {"fiscal_code": fiscal_code,
             "purchase_order.po_number": {"$in": po_number}},
            {"$push": {
                "purchase_order.$[].access_permission": {
                    "protocol_number": protocol_number,
                    "plant": plant,
                    "status": status,
                    "validity_end_date": validity_end_date,
                    "address": address,
                    "gates": gates
                }
            }})

        if create_access_permission.modified_count > 0:
            return create_access_permission
        else:
            raise HTTPException(status_code=400, detail="Error trying to insert access permission")
            
    """
    UPDATE methods
    """
    async def update_employee(self, fiscal_code:str, update_data : ModifiedEmployee): 
        """
        Updates an employee in the database.

        Args:
            fiscal_code (str): The fiscal code of the employee.
            update_data (ModifiedEmployee): The modified employee data.

        Returns:
            dict: A dictionary containing a message indicating the success or failure of the operation.
        """  
        try: 
            updated_employee = await self._db_collection.find_one_and_update(
                {"fiscal_code": fiscal_code},
                {"$set": update_data},
                return_document = True
            )
            
            if updated_employee:
                return updated_employee
            else:
                raise HTTPException(status_code=400, detail="Error trying to update employee")
        except DuplicateKeyError as e:
            #print(f"Error {e}")
            print(f"Error message {e.details["errmsg"]}")

            if "user_credentials.user_name" in e.details["errmsg"]:
                print("us")
                raise HTTPException(status_code=400, detail=f"User name: {update_data['user_credentials']['user_name'] } already in use")
            
            elif "fiscal_code" in e.details["errmsg"]:
                print("fs")
                raise HTTPException(status_code=400, detail=f"Fiscal code: {fiscal_code} already exists")
            
            elif "user_credentials.email" in e.details["errmsg"]:
                print("email")
                raise HTTPException(status_code=400, detail=f"Email: {update_data['user_credentials']['email']} already in use")

    async def update_access_permission(self,
                                        po_number:str,
                                        old_protocol_number:str,
                                        update_data:dict):
        """
        Updated an access permission in a purchase order.

        Args:
            po_number (str): The purchase order number.
            old_protocol_number (str): The old protocol number of the access permission.
            update_data (dict): The updated access permission data.

        Returns:
            dict: A dictionary containing a message indicating the success or failure of the operation.
        """
        
        update_query = {"$set": {}}
        for key, value in update_data.items():
            update_query["$set"][f"purchase_order.$[po].access_permission.$[ap].{key}"] = value
        
        access_permission = await self._db_collection.update_many(
            {"purchase_order.po_number":po_number,
            "purchase_order.access_permission.protocol_number":old_protocol_number},
            update_query,
            array_filters=[{"po.po_number":po_number},
                           {"ap.protocol_number":old_protocol_number}],
        )
        
        if access_permission.modified_count <= 0:
            raise HTTPException(status_code=404, detail="Access Permission not inserted")
    
        return access_permission
        
       
    
    async def update_purchase_order(self,
                                    old_po_number:str,
                                    update_data:dict):
        
        """
        Updates a purchase order in the database.

        Args:
            old_po_number (str): The old purchase order number.
            update_data (dict): The updated purchase order data.

        Returns:
            dict: A dictionary containing a message indicating the success or failure of the operation.
        """
        update_query = {"$set": {}}
        for key, value in update_data.items():
            if isinstance(value,dict):
                for sub_key,sub_value in value.items():
                    update_query["$set"][f"purchase_order.$[po].{key}.{sub_key}"] = sub_value
            else:
                update_query["$set"][f"purchase_order.$[po].{key}"] = value

        purchase_order = await self._db_collection.update_many(
            {"purchase_order.po_number" :old_po_number},
            update_query,
            array_filters=[{"po.po_number":old_po_number}]
        )

        if purchase_order.modified_count > 0:
            return purchase_order
        else:
            raise HTTPException(status_code=400, detail=f"Order trying to update PO: {old_po_number}")
        
    """
    DELETE methods
    """
    async def delete_employee(self,fiscal_code:str):
        """
        Deletes an employee from the database.

        Args:
            fiscal_code (str): The fiscal code of the employee.

        Returns:
            dict: A dictionary containing a message indicating the success or failure of the operation.
        """

        find_first = await self._db_collection.find_one({"fiscal_code":fiscal_code})

        if not find_first:
            raise HTTPException(status_code=404, detail=f"Employee with {fiscal_code} not found")

        delete = await self._db_collection.delete_one({"fiscal_code":fiscal_code})

        if delete.deleted_count == 1:
            return delete 
        
        raise HTTPException(status_code=400, detail=f"Failed to delete employee with {fiscal_code}")

    async def delete_purchase_order(self,
                                    po_number:str):
        """
        Deletes a purchase order from the database.

        Args:
            po_number (str): The purchase order number.

        Returns:
            dict: A dictionary containing a message indicating the success or failure of the operation.
        """
        
        delete_purchase_order = await self._db_collection.update_many(
                                    {"purchase_order.po_number":po_number},
                                    {"$pull": {"purchase_order": {"po_number": po_number}}})
        
    
        if delete_purchase_order.modified_count > 0:
            return delete_purchase_order
            
        raise HTTPException(status_code=400, detail=f"Failed to delete purchase order with {po_number}")

                    




           
    

        

