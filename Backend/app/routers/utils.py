import os
import io
from fastapi import UploadFile
from fastapi import UploadFile
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/drive"]
SERVICE_ACCOUNT_FILE = "accesspermissionstorage-3b70e75ecae3.json"

def format_path(file_path: str) -> str:
    """
    Formats a file path to a valid path for the operating system.
    
    Args:
        file_path (str): The file path to be formatted.
    
    Returns:
        str: The formatted file path.
    """
    normalized_path = os.path.normpath(file_path)  # Normalize the path
    return normalized_path.replace(os.path.sep, "/")  # Replace '\' with '/'

async def save_and_rename_files(files: list[UploadFile], file_names: list[str]) -> list[UploadFile]:
    """
    Renames the list of files based on the provided file_names, saves them to root_dir,
    and returns the renamed files for uploading to Google Drive.

    Args:
        files (list[UploadFile]): The files to be saved.
        file_names (list[str]): The custom names for the files.
        root_dir (str): The root directory where the files will be saved.

    Returns:
        list[UploadFile]: The list of renamed files ready for upload.
    """
    if not files:
        raise ValueError("No files provided")
    
    if len(files) != len(file_names):
        raise ValueError("The number of files does not match the number of file names provided.")
    
    renamed_files = []

    for file, new_name in zip(files, file_names):
        # Obtener la extensión del archivo original
        file_extension = os.path.splitext(file.filename)[1]

        # Renombrar el archivo
        renamed_file_name = f"{new_name}{file_extension}"

        # Leer el contenido del archivo
        file_content = await file.read()

        # Crear un nuevo UploadFile simulado con el nuevo nombre y contenido
        renamed_file = UploadFile(
            filename=renamed_file_name,
            file=io.BytesIO(file_content),
            headers=file.headers
        )
        renamed_files.append(renamed_file)

    return renamed_files

async def authenticate_google_drive(service_account_file: str, scopes: list[str]):
    """
    Authenticate with Google Drive using a service account file and scopes.

    Args:
        service_account_file (str): The path to the service account file.
        scopes (list[str]): The scopes to be used for authentication.

    Returns:
        service_account.Credentials: The authenticated credentials.
    """
    credentials = service_account.Credentials.from_service_account_file(
        service_account_file, scopes=scopes
    )
    return credentials

async def create_folder(folder_name:str, parent_folder_id:str):
    credentials = await authenticate_google_drive(service_account_file=SERVICE_ACCOUNT_FILE, scopes=SCOPES) 

    drive_service = build("drive", "v3", credentials=credentials)

    folder_metada = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_folder_id]
    }

    create_folder = drive_service.files().create(
        body=folder_metada, 
        fields="id"
        ).execute()
    
    #print(f"Folder {folder_name} created with id {create_folder['id']}")
    return create_folder['id']

async def upload_file_to_drive(file: UploadFile, folder_id: str):
    credentials = await authenticate_google_drive(service_account_file=SERVICE_ACCOUNT_FILE, scopes=SCOPES) 

    drive_service = build("drive", "v3", credentials=credentials)

    """Subir archivo a Google Drive"""
    file_metadata = {
        "name": file.filename,
        "parents": [folder_id],
    }
    #print(file)
    file_content = await file.read()  # Leer el archivo asincrónicamente
    media = MediaIoBaseUpload(io.BytesIO(file_content), mimetype=file.content_type)
    
    uploaded_file = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields="id"
    ).execute()

    return uploaded_file.get("id")

async def replace_file_in_folder(folder_id:str, file_name:str, file: UploadFile):
    credentials = await authenticate_google_drive(service_account_file=SERVICE_ACCOUNT_FILE, scopes=SCOPES) 

    drive_service = build("drive", "v3", credentials=credentials)

    try:
        # 1. Buscar el archivo por nombre dentro de la carpeta
        query = f"name='{file_name}' and '{folder_id}' in parents and trashed=false"
        results = drive_service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get('files', [])

        # 2. Si el archivo existe, eliminarlo
        if files:
            file_id = files[0]['id']
            #print(f"Archivo encontrado: {file_name} (ID: {file_id}). Eliminando...")
            drive_service.files().delete(fileId=file_id).execute()
        else:
            print(f"No se encontró el archivo {file_name}. Subiendo uno nuevo...")

        # 3. Subir el nuevo archivo
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }

        file_content = await file.read()  # Leer el archivo asincrónicamente
        media = MediaIoBaseUpload(io.BytesIO(file_content), mimetype=file.content_type)

        file = drive_service.files().create(
            body=file_metadata, 
            media_body=media, 
            fields='id'
        ).execute()

        #print(f"Archivo {file_name} subido con éxito. Nuevo ID: {file.get('id')}")
        return file.get('id')

    except Exception as e:
        print(f"Error al reemplazar el archivo: {e}")

async def download_file_drive(real_file_id, file_path):
    credentials = await authenticate_google_drive(service_account_file=SERVICE_ACCOUNT_FILE, scopes=SCOPES) 

    drive_service = build("drive", "v3", credentials=credentials)

    file_id = real_file_id

    # pylint: disable=maybe-no-member
    
    try:
        request = drive_service.files().get_media(fileId=file_id)
        file = io.BytesIO()
        downloader = MediaIoBaseDownload(file, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        
        with open(file_path, "wb") as f:
            f.write(file.getvalue())
        print(f"Archivo guardado como: {file_path}")

    except HttpError as error:
        print(f"An error occurred: {error}")
        file = None

    return file_path

async def get_file(file_id: str) -> UploadFile:
    """Retrieves a file from Google Drive.

    Args:
        file_id (str): The ID of the file to retrieve.

    Returns:
        UploadFile: The file object.
    """
    credentials = await authenticate_google_drive(service_account_file=SERVICE_ACCOUNT_FILE, scopes=SCOPES) 

    drive_service = build("drive", "v3", credentials=credentials)

    request = drive_service.files().get_media(fileId=file_id)
    file_io = io.BytesIO()
    downloader = MediaIoBaseDownload(file_io, request)

    done = False
    while not done:
        status, done = downloader.next_chunk()

    # Retornar el contenido en bytes
    file_io.seek(0)
    return file_io.read()



   
    
        
        