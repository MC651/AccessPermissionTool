import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
import io
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError
import mimetypes
from googleapiclient.http import MediaIoBaseUpload

SCOPES = ["https://www.googleapis.com/auth/drive"]
SERVICE_ACCOUNT_FILE = "accesspermissionstorage-3b70e75ecae3.json"
PARENT_FOLDER_ID = "1sEx_CLNxaorL4JH4mR-gyRCu2eswevnS"

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)

drive_service = build("drive", "v3", credentials=credentials)

#print(credentials)
#print(drive_service)


def create_folder(folder_name:str, parent_folder_id:str):
    folder_metada = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_folder_id]
    }

    create_folder = drive_service.files().create(
        body=folder_metada, 
        fields="id"
        ).execute()
    
    print(f"Folder {folder_name} created with id {create_folder['id']}")
    return create_folder['id']


def download_file_drive(real_file_id, file_name):
    """Descarga un archivo desde Google Drive y lo guarda localmente."""
    # Inicializa el servicio de Drive
    drive_service = build("drive", "v3", credentials=credentials)
    
    # Crea un buffer de memoria para descargar el archivo
    file = io.BytesIO()
    
    try:
        # Prepara la solicitud de descarga
        request = drive_service.files().get_media(fileId=real_file_id)
        downloader = MediaIoBaseDownload(file, request)
        
        # Descarga el archivo en chunks
        done = False
        while not done:
            status, done = downloader.next_chunk()
            print(f"Descargando: {int(status.progress() * 100)}%")

        # Escribe el archivo descargado en el sistema de archivos local
        with open(file_name, "wb") as f:
            f.write(file.getvalue())
        print(f"Archivo guardado como: {file_name}")

    except HttpError as error:
        print(f"Ocurrió un error: {error}")
        return None

    return file.getvalue()

# Parámetros
REAL_FILE_ID = "1nEaHnZ_stCu4gpxdHkRetaDjcXZiTYj6"
FILE_NAME = "archivo_descargado.pdf"  # Cambia la extensión si es necesario

# Llama a la función
#download_file_drive(real_file_id=REAL_FILE_ID, file_name=FILE_NAME)



def replace_file_in_folder(folder_id, file_name, new_file_path):
    try:
        # 1. Buscar el archivo por nombre dentro de la carpeta
        query = f"name='{file_name}' and '{folder_id}' in parents and trashed=false"
        results = drive_service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get('files', [])

        # 2. Si el archivo existe, eliminarlo
        if files:
            file_id = files[0]['id']
            print(f"Archivo encontrado: {file_name} (ID: {file_id}). Eliminando...")
            drive_service.files().delete(fileId=file_id).execute()
        else:
            print(f"No se encontró el archivo {file_name}. Subiendo uno nuevo...")

        # 3. Subir el nuevo archivo
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        
        # Detectar el MIME type del archivo
        mime_type, _ = mimetypes.guess_type(new_file_path)

        media = MediaIoBaseUpload(new_file_path, mimetype=mime_type, resumable=True)
        file = drive_service.files().create(
            body=file_metadata, 
            media_body=media, 
            fields='id'
        ).execute()

        print(f"Archivo {file_name} subido con éxito. Nuevo ID: {file.get('id')}")
        return file.get('id')

    except Exception as e:
        print(f"Error al reemplazar el archivo: {e}")

""" # Parámetros
folder_id = '1TouUDUApGNnvLr2NYfknemG7J8TujOh1'  # ID de la carpeta en Google Drive
file_name = 'profile_image.png'  # Nombre del archivo a reemplazar
new_file_path = r'profile_image.png'  # Ruta local del nuevo archivo

# Llamar a la función
replace_file_in_folder(folder_id, file_name, new_file_path) """

def get_file(file_id: str) -> str:
    """Retrieves a file from Google Drive.

    Args:
        file_id (str): The ID of the file to retrieve.

    Returns:
        str: The path to the downloaded file.
    """
   

    drive_service = build("drive", "v3", credentials=credentials)

    file = drive_service.files().get_media(fileId=file_id).execute()
    print(file)

get_file("1gRyNM48fGuu3fT340xtCtXhzttDWZ6tr")