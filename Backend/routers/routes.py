from fastapi import APIRouter, Depends, File, Form, HTTPException, Path, UploadFile,status, Response
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import EmailStr
from models.models import Person,Token,FilteredEmployee,ModifiedEmployee,PurchaseOrder,AccessPermission
from dal.employees_dal import EmployeesDAL
from database import get_employees_dal
from fastapi.security import OAuth2PasswordRequestForm,OAuth2PasswordBearer
import jwt
from datetime import datetime,timedelta,timezone
from jwt.exceptions import InvalidTokenError
from typing import Annotated, Optional
import os
from dotenv import load_dotenv
load_dotenv()
router = APIRouter()
router.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

""" 
Utils
"""

def format_path(file_path: str) -> str:
    normalized_path = os.path.normpath(file_path)  # Normaliza la ruta
    return normalized_path.replace(os.path.sep, "/")  # Reemplaza '\' por '/'

async def save_files(files: list[UploadFile], file_names: list[str], root_dir: str) -> list[str]:
    """
    Guarda una lista de archivos en el directorio especificado con nombres personalizados
    y devuelve las rutas de los archivos guardados.

    Args:
        files (list[UploadFile]): Archivos a guardar.
        file_names (list[str]): Lista de nombres personalizados para los archivos.
        root_dir (str): Directorio raíz donde se guardarán los archivos.

    Returns:
        list[str]: Lista de rutas de los archivos guardados.
    """
    if not files:
        raise ValueError("No files provided")
    
    if len(files) != len(file_names):
        raise ValueError("La cantidad de archivos no coincide con la cantidad de nombres proporcionados.")
    
    saved_file_paths = []

    for file, new_name in zip(files, file_names):
        print(file,new_name)
        # Cambiar el nombre del archivo
        file_extension = os.path.splitext(file.filename)[1]  # Obtener la extensión del archivo original
        print(file_extension)
        renamed_file = f"{new_name}{file_extension}"  # Combinar el nuevo nombre con la extensión
        print(renamed_file)

        # Construir la ruta del archivo
        file_location = os.path.join(root_dir, renamed_file)
        formatted_file_location = format_path(file_location)  # Suponiendo que tienes una función format_path

        # Guardar el archivo
        with open(formatted_file_location, "wb") as f:
            f.write(await file.read())

        saved_file_paths.append(formatted_file_location)

    return saved_file_paths

"""
Application ENDPOINTS
    GET
    POST
    PATCH
    DELETE
"""

"""
Login & Authentication
"""
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
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

"""
GET Methods
"""

@router.get("/employe/{first_name}", response_model=Person)
async def get_employee(first_name: str, 
                       employees_dal: EmployeesDAL = Depends(get_employees_dal)):
    try:
        employee = await employees_dal.list_employees(first_name)
        return employee
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.get("/my_info/",response_model=Person)
async def my_info(current_user: Annotated[Person, Depends(get_current_user)]):
    return current_user

@router.get("/all") 
async def get_all_employees(employees_dal: EmployeesDAL = Depends(get_employees_dal)) -> list[FilteredEmployee]:
    return [employee async for employee in  employees_dal.get_all()]

"""
POST Methods
"""

@router.post("/login")
async def login_for_access_token(response: Response,form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
                                 employees_dal: EmployeesDAL = Depends(get_employees_dal))-> Token:
    user = await employees_dal.email_password_verification(form_data.username,form_data.password)
    print(user)
    #print(f"User from Login: {user}")
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
    birth_date: datetime = Form(...),  # Convertiremos a datetime más tarde
    id_card_end_date: datetime = Form(...),  # Igual
    contract_type: str = Form(...),
    contract_validity_start_date: datetime = Form(...),  # Igual
    contract_validity_end_date: datetime = Form(...),  # Igual
    visa_start_date: datetime = Form(...),  # Igual
    visa_end_date: datetime = Form(...),  # Igual
    email: EmailStr = Form(...),
    password: str = Form(...),
    purchase_order: Optional[list] = Form(default=[]),  # Convertir a lista más tarde si es necesario
    profile_image: UploadFile = File(...),
    id_card: UploadFile = File(...),
    visa: UploadFile = File(...),
    unilav: UploadFile = File(...),
    employees_dal: EmployeesDAL = Depends(get_employees_dal)
):      
        
        if len(purchase_order) == 1:
            purchase_order = []

        root = os.path.join(os.getenv("UPLOAD_DIR"),fiscal_code)
        os.makedirs(root,exist_ok=True)

        files_to_save = [profile_image, id_card, visa, unilav]
        file_names = ["profile_image", "id_card", "visa", "unilav"]
        
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
            visa_path= saved_file_paths[2],
            unilav_path= saved_file_paths[3]
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
    employee_update: ModifiedEmployee,
    employees_dal: EmployeesDAL = Depends(get_employees_dal)
):
    try: 
        # Primero, busca el empleado en la base de datos
        #print(fiscal_code)
        #print(employee_update)
        existing_employee = await employees_dal.list_employees(fiscal_code)

        #update_data = employee_update.model_dump(exclude_unset=True)  # Excluye los campos que no fueron enviados
        # Realiza la actualización en la base de datos
        result = await employees_dal.update_employee(fiscal_code, employee_update.model_dump(exclude_unset=True))

        return {"message": f"Employee with fiscal code: {fiscal_code} updated successfully"}
    
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.patch("/update_access_permission/{po_number}/{old_protocol_number}")
async def update_access_permission(
    po_number: str,
    old_protocol_number: str,
    access_permission: AccessPermission,
    employees_dal: EmployeesDAL = Depends(get_employees_dal)
):
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
    try: 
        result = await employees_dal.update_purchase_order(
            old_po_number=old_po_number,
            update_data= purchase_order.model_dump(exclude_unset=True)
        )
        return {"message": f"{result.modified_count} Purchase Order(s) updated successfully."}
    
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

"""
DELEte Methods
"""

@router.delete("/delete/{fiscal_code}")
async def delete_employee(fiscal_code:str,
                          employees_dal : EmployeesDAL = Depends(get_employees_dal)):
    try:
        result = await employees_dal.delete_employee(fiscal_code)

        return {"message": f"Employee with {fiscal_code} deleted"}

    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.delete("/delete_po/{po_number}")
async def delete_purchase_order(po_number:str,
                          employees_dal : EmployeesDAL = Depends(get_employees_dal)):
    try:
        result = await employees_dal.delete_purchase_order(po_number)
        return {"message": f"Purchase Order {po_number} deleted successfully."}

    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.post("/upload_file/")
async def upload_file(first_name: str = Form(...),
                      last_name: str = Form(...),
                      file: UploadFile = File(...),
                      image: UploadFile = File(...),
                      employees_dal: EmployeesDAL = Depends(get_employees_dal)):
    print(first_name)
    print(last_name)
    print(file.filename)
    print(image.filename)
    file_location = os.path.join(os.getenv("UPLOAD_DIR"), file.filename)
    image_location = os.path.join(os.getenv("UPLOAD_DIR"), image.filename)
    print(file_location)
    print(image_location)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    
    with open(image_location, "wb") as f:
        f.write(await image.read())
    try:
        insert_files = await employees_dal.process_files(first_name,last_name,image_location,file_location)
        #print(insert_files)
        return {"Message":"File Uploaded"}

    except HTTPException as e:
        print(e)
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    

@router.get("/retrieve_files/{fiscal_code}/")
async def retrieve_files(fiscal_code: str, employees_dal : EmployeesDAL = (Depends(get_employees_dal))):
    file_path = os.path.join(os.getenv("UPLOAD_DIR"),fiscal_code,"profile_image.png")
    print(file_path)
    formated_file_path = format_path(file_path)
    print(formated_file_path)

    if not os.path.exists(formated_file_path):
        raise HTTPException(status_code=400,detail="Path's doesn't exist")
    return FileResponse(file_path)

@router.get("/download/{fiscalCode}/{name}")
async def download_file(fiscalCode: str, name: str):
    file_path = os.path.join(os.getenv("UPLOAD_DIR"), fiscalCode, name)
    print(file_path)
    if not os.path.exists(file_path):  # Verifica que el archivo exista
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        path=file_path,
        filename=name
    )


    



