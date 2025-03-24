import json
import os
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile,status, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr


from app.models.Person import Person
from app.models.Token import Token
from app.models.FilteredEmployee import FilteredEmployee
from app.models.PurchaseOrder import PurchaseOrder
from app.models.AccessPermission import AccessPermission
from app.dal.employees_dal import EmployeesDAL
from app.database.dependencies import get_employees_dal
from app.routers.auth import create_access_token
from app.routers.utils import format_path,save_files
from app.routers.auth import get_current_user 


""" from models.Person import Person
from models.Token import Token
from models.FilteredEmployee import FilteredEmployee
from models.PurchaseOrder import PurchaseOrder
from models.AccessPermission import AccessPermission
from dal.employees_dal import EmployeesDAL
from database.dependencies import get_employees_dal
from routers.auth import create_access_token
from routers.utils import format_path,save_files
from routers.auth import get_current_user """

from typing import Annotated, Any, Dict, Optional
from datetime import datetime,timedelta
from dotenv import load_dotenv

#Load environment variables
load_dotenv()

#Create API Router
router = APIRouter()

#Mount Static Files for File Storage
router.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

"""
Application ENDPOINTS
    GET
    POST
    PATCH
    DELETE
"""

"""
GET Methods
"""
@router.get("/employe/{first_name}", response_model=Person)
async def get_employee(first_name: str, 
                       employees_dal: EmployeesDAL = Depends(get_employees_dal)):
    """
    Retrieves an employee by their first name.

    Args:
        first_name (str): The first name of the employee.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        Person: Deserialized employee data.
    """
    try:
        employee = await employees_dal.list_employees(first_name)
        return employee
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.get("/my_info/",response_model=Person)
async def my_info(current_user: Annotated[Person, Depends(get_current_user)]):
    """
    Retrieves the current user's information.

    Args:
        current_user (Annotated[Person, Depends(get_current_user)]): The current user.

    Returns:
        Person: Deserialized employee data.
    """

    return current_user

@router.get("/all") 
async def get_all_employees(employees_dal: EmployeesDAL = Depends(get_employees_dal)) -> list[FilteredEmployee]:
    """
    Retrieves all employees.

    Args:
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        list[FilteredEmployee]: Deserialized employee data.
    
    """
    return [employee async for employee in  employees_dal.get_all()]

@router.get("/retrieve_files/{fiscal_code}/")
async def retrieve_files(fiscal_code: str) -> FileResponse:
    """
    Retrieves the files of an employee.

    Args:
        fiscal_code (str): The fiscal code of the employee.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        FileResponse: The file response of the file.

    """
    file_path = os.path.join(os.getenv("UPLOAD_DIR"),fiscal_code,"profile_image.png")

    formated_file_path = format_path(file_path)


    if not os.path.exists(formated_file_path):
        raise HTTPException(status_code=400,detail="Path's doesn't exist")
    return FileResponse(file_path)

@router.get("/download/{fiscalCode}/{name}")
async def download_file(fiscalCode: str, name: str) -> FileResponse:
    """
    Downloads a file.

    Args:
        fiscalCode (str): The fiscal code of the employee.
        name (str): The name of the file.

    Returns:
        FileResponse: The file response of the file.
    
    """
    file_path = os.path.join(os.getenv("UPLOAD_DIR"), fiscalCode, name)
    if not os.path.exists(file_path):  
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        path=file_path,
        filename=name
    )

"""
POST Methods
"""

@router.post("/login")
async def login_for_access_token(response: Response,form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
                                 employees_dal: EmployeesDAL = Depends(get_employees_dal))-> Token:
    """
    Logs in a user and returns an access token.

    Args:
        response (Response): The response object.
        form_data (Annotated[OAuth2PasswordRequestForm, Depends()]): The form data for login.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        Token: The access token.
    """
    user = await employees_dal.email_password_verification(form_data.username,form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=120) 
    access_token = create_access_token(data={"us":user["user_credentials"]["user_name"],
                                             "ut":user["user_credentials"]["user_type"],
                                             "fs":user["fiscal_code"]}, 
                                             expires_delta=access_token_expires)
    print(user)
    return Token(access_token=access_token, token_type="bearer",
                 us=user["user_credentials"]["user_name"],
                 fs=user["fiscal_code"],
                 ut=user["user_credentials"]["user_type"])
                                             

@router.post("/create")
async def create_employee(
    first_name: str = Form(...),
    last_name: str = Form(...),
    user_name: str = Form(...),
    fiscal_code: str = Form(...),
    birth_date: datetime = Form(...),  
    id_card_end_date: datetime = Form(...), 
    contract_type: str = Form(...),
    contract_validity_start_date: datetime = Form(...), 
    contract_validity_end_date: datetime = Form(...), 
    visa_start_date: Optional[datetime] = Form(None),  
    visa_end_date: Optional[datetime] = Form(None),
    email: EmailStr = Form(...),
    password: str = Form(...),
    purchase_order: Optional[list] = Form(default=[]),  
    profile_image: UploadFile = File(...),
    id_card: UploadFile = File(...),
    visa: Optional[UploadFile] = File(None),
    unilav: UploadFile = File(...),
    employees_dal: EmployeesDAL = Depends(get_employees_dal)
):      
    """
    Creates a new employee.

    Args:
        first_name (str): The first name of the employee.
        last_name (str): The last name of the employee.
        user_name (str): The user name of the employee.
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
        purchase_order (Optional[list]): The purchase order of the employee. 
        profile_iamge (UploadFile): The profile image of the employee.
        id_card (UploadFile): The ID card of the employee.
        visa (UploadFile): The visa of the employee.
        unilav (UploadFile): The unilav of the employee.
        employees_dal (EmployeesDAL): The employees DAL.
zzz
    Returns:  
        dict: A dictionary containing a message indicating the success or failure of the operation.
    """
    root = os.path.join(os.getenv("UPLOAD_DIR"),fiscal_code)
    os.makedirs(root,exist_ok=True)

    files_to_save = [profile_image, id_card, unilav]
    file_names = ["profile_image", "id_card", "unilav"]
    if visa:
        files_to_save.append(visa)
        file_names.append("visa")

        
    saved_file_paths = await save_files(file_names=file_names, root_dir=root,files=files_to_save)
    
    #First Process images, save them and return the path
    employee = await employees_dal.create_employee(
            first_name= first_name,
            last_name= last_name,
            fiscal_code= fiscal_code,
            birth_date= birth_date,
            id_card_end_date=id_card_end_date,
            contract_type=contract_type,
            contract_validity_start_date= contract_validity_start_date,
            contract_validity_end_date=contract_validity_end_date,
            visa_start_date=visa_start_date,
            visa_end_date=visa_end_date,
            password = password,
            email = email,
            user_name= user_name,
            purchase_order= purchase_order,
            profile_image_path= saved_file_paths[0],
            id_card_path= saved_file_paths[1],
            unilav_path= saved_file_paths[2],
            visa_path= saved_file_paths[3] if len(saved_file_paths) > 3 else None
            ) 
                
    return {"message" : f"Employee {first_name} {last_name} created successfully"}
        

"""
PATCH Methods
"""     

@router.patch("/create_purchase_order")
async def create_purchase_order(
    fiscal_codes: list[str] ,
    purchase_order: PurchaseOrder,
    employees_dal: EmployeesDAL = Depends(get_employees_dal)
):
    """
    Creates a purchase order.

    Args:
        fiscal_codes (list[str]): The fiscal codes of the employees involved in the purchase order.
        purchase_order (PurchaseOrder): The purchase order to be created.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        dict: A dictionary containing a message indicating the success or failure of the operation.
    """
    try: 
        result = await employees_dal.create_purchase_order(
            fiscal_codes=fiscal_codes,
            po_number=purchase_order.po_number,
            description=purchase_order.description,
            issue_date=purchase_order.issue_date,
            validity_end_date=purchase_order.validity_end_date,
            duvri=purchase_order.duvri,
            requester_first_name=purchase_order.requester.first_name,
            requester_last_name=purchase_order.requester.last_name,
            requester_email=purchase_order.requester.email,
            locations=purchase_order.locations,
            subapalto_number=purchase_order.subapalto.subapalto_number,
            subapalto_status=purchase_order.subapalto.subapalto_status,
            access_permission=purchase_order.access_permission,
        )
        
        return {"message": f"{result.raw_result['nModified']} Purchase Order(s) inserted successfully."}
    
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.patch("/insert_purchase_order/{fiscal_code}")
async def insert_purchase_order(fiscal_code: str, purchase_order: PurchaseOrder, employees_dal: EmployeesDAL = Depends(get_employees_dal)): 
    """
    Inserts a purchase order.

    Args:
        fiscal_code (str): The fiscal code of the employee.
        purchase_order (PurchaseOrder): The purchase order to be inserted.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        dict: A dictionary containing a message indicating the success or failure of the operation.
    """
    try:
        result = await employees_dal.insert_purchase_order(
            fiscal_code=fiscal_code,
            po_number= purchase_order.po_number,
            description=purchase_order.description,
            issue_date=purchase_order.issue_date,
            validity_end_date=purchase_order.validity_end_date,
            duvri=purchase_order.duvri,
            requester_first_name=purchase_order.requester.first_name,
            requester_last_name=purchase_order.requester.last_name,
            requester_email=purchase_order.requester.email,
            locations=purchase_order.locations,
            subapalto_number=purchase_order.subapalto.subapalto_number,
            subapalto_status=purchase_order.subapalto.subapalto_status,
            access_permission=purchase_order.access_permission,
            )
        
        return {"message": f"{result.modified_count} Purchase Order(s) inserted successfully."}
    
    except HTTPException as e:
        #print(e)
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.patch("/insert_access_permission/{fiscal_code}")
async def insert_access_permission(
    fiscal_code: str,
    po_numbers: list[str],
    access_permission: AccessPermission,
    employees_dal: EmployeesDAL = Depends(get_employees_dal)
):
    """
    Inserts an access permission.

    Args:
        fiscal_code (str): The fiscal code of the employee.
        po_numbers (list[str]): The purchase order numbers of the purchase orders to be updated.
        access_permission (AccessPermission): The access permission to be inserted.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        dict: A dictionary containing a message indicating the success or failure of the operation.
    """
    try:
        inserted_access_permission = await employees_dal.insert_access_permission(
            fiscal_code=fiscal_code,
            po_number= po_numbers,
            protocol_number=access_permission.protocol_number,
            plant=access_permission.plant,
            status=access_permission.status,
            validity_end_date=access_permission.validity_end_date,
            address=access_permission.address,
            gates=access_permission.gates
        )
        
        return {"message": f"{inserted_access_permission.modified_count} Access permission(s) inserted successfully."}
    
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
@router.patch("/update/{fiscal_code}")
async def update_employee(
    fiscal_code: str,
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    birth_date: Optional[datetime] = Form(None),
    contract_type: Optional[str] = Form(None),
    contract_validity_start_date: Optional[datetime] = Form(None),
    contract_validity_end_date: Optional[datetime] = Form(None),
    id_card_end_date: Optional[datetime] = Form(None),
    visa_start_date: Optional[datetime] = Form(None),
    visa_end_date: Optional[datetime] = Form(None),
    user_credentials: Optional[str] = Form(None),  # Se envía como JSON string
    profile_image: Optional[UploadFile] = File(None),
    id_card: Optional[UploadFile] = File(None),
    visa: Optional[UploadFile] = File(None),
    unilav: Optional[UploadFile] = File(None),
    employees_dal: EmployeesDAL = Depends(get_employees_dal),
):
    """
    Updates an employee.

    Args:
        fiscal_code (str): The fiscal code of the employee.
        first_name (Optional[str]): The first name of the employee.
        last_name (Optional[str]): The last name of the employee.
        birth_date (Optional[datetime]): The birth date of the employee.
        contract_type (Optional[str]): The type of contract the employee has.
        contract_validity_start_date (Optional[datetime]): The start date of the contract validity.
        contract_validity_end_date (Optional[datetime]): The end date of the contract validity.
        id_card_end_date (Optional[datetime]): The end date of the employee's ID card.
        visa_start_date (Optional[datetime]): The start date of the employee's visa.
        visa_end_date (Optional[datetime]): The end date of the employee's visa.
        user_credentials (Optional[str]): The user credentials of the employee.
        profile_image (Optional[UploadFile]): The profile image of the employee.
        id_card (Optional[UploadFile]): The ID card of the employee.
        visa (Optional[UploadFile]): The visa of the employee.
        unilav (Optional[UploadFile]): The unilav of the employee.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        dict: A dictionary containing a message indicating the success or failure of the operation.
    """
    try:
        
        existing_employee = await employees_dal.list_employees(fiscal_code)

       
        update_data: Dict[str, Any] = {
            "first_name": first_name,
            "last_name": last_name,
            "birth_date": birth_date,
            "contract_type": contract_type,
            "contract_validity_start_date": contract_validity_start_date,
            "contract_validity_end_date": contract_validity_end_date,
            "id_card_end_date": id_card_end_date,
            "visa_start_date": visa_start_date,
            "visa_end_date": visa_end_date
        }

       
        if user_credentials:
            try:
                update_data["user_credentials"] = json.loads(user_credentials)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=400, detail="Invalid format for user_credentials"
                )

        if profile_image:
           
            file_location = f"./uploads/{fiscal_code}/profile_image.png"
            with open(file_location, "wb") as file:
                file.write(await profile_image.read())
            update_data["profile_image_path"] = file_location
        
        if id_card:
            file_location = f"./uploads/{fiscal_code}/id_card.png"
            with open(file_location, "wb") as file:
                file.write(await id_card.read())
            update_data["id_card_path"] = file_location

        if visa:
            file_location = f"./uploads/{fiscal_code}/visa.pdf"
            with open(file_location, "wb") as file:
                file.write(await visa.read())
            update_data["visa_path"] = file_location
        
        if unilav:
            file_location = f"./uploads/{fiscal_code}/unilav.pdf"
            with open(file_location, "wb") as file:
                file.write(await unilav.read())
            update_data["unilav_path"] = file_location

       
        update_data = {key: value for key, value in update_data.items() if value is not None}

        result = await employees_dal.update_employee(fiscal_code, update_data)

        return {"message": f"Employee with fiscal code: {fiscal_code} updated successfully"}

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/update_access_permission/{po_number}/{old_protocol_number}")
async def update_access_permission(
    po_number: str,
    old_protocol_number: str,
    access_permission: AccessPermission,
    employees_dal: EmployeesDAL = Depends(get_employees_dal)
):
    """
    Updates an access permission.

    Args:
        po_number (str): The purchase order number of the access permission.
        old_protocol_number (str): The old protocol number of the access permission.
        access_permission (AccessPermission): The access permission to be updated.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        dict: A dictionary containing a message indicating the success or failure of the operation.
    """
    try:
        result = await employees_dal.update_access_permission(
            po_number=po_number,
            old_protocol_number=old_protocol_number,
            update_data= access_permission.model_dump(exclude_unset=True)
        )

        return {"message": f"{result.modified_count} Access Permission(s) updated successfully."}
    
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.patch("/update_purchase_order/{old_po_number}")
async def update_purchase_order(
    old_po_number: str,
    purchase_order: PurchaseOrder,  
    employees_dal: EmployeesDAL = Depends(get_employees_dal)
):
    """
    Updates a purchase order.

    Args:
        old_po_number (str): The old purchase order number.
        purchase_order (PurchaseOrder): The purchase order to be updated.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        dict: A dictionary containing a message indicating the success or failure of the operation.
    """
    try: 
        result = await employees_dal.update_purchase_order(
            old_po_number=old_po_number,
            update_data= purchase_order.model_dump(exclude_unset=True)
        )
        return {"message": f"{result.modified_count} Purchase Order(s) updated successfully."}
    
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

"""
DELETE Methods
"""

@router.delete("/delete/{fiscal_code}")
async def delete_employee(fiscal_code:str,
                          employees_dal : EmployeesDAL = Depends(get_employees_dal)):
    """
    Deletes an employee.

    Args:
        fiscal_code (str): The fiscal code of the employee.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        dict: A dictionary containing a message indicating the success or failure of the operation.
    
    """
    try:
        result = await employees_dal.delete_employee(fiscal_code)

        return {"message": f"Employee with {fiscal_code} deleted"}

    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.delete("/delete_po/{po_number}")
async def delete_purchase_order(po_number:str,
                          employees_dal : EmployeesDAL = Depends(get_employees_dal)):
    """
    Deletes a purchase order.

    Args:
        po_number (str): The purchase order number.
        employees_dal (EmployeesDAL): The employees DAL.

    Returns:
        dict: A dictionary containing a message indicating the success or failure of the operation.
    """
    try:
        result = await employees_dal.delete_purchase_order(po_number)
        return {"message": f"Purchase Order {po_number} deleted successfully."}

    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)




    



