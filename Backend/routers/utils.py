import os
from fastapi import UploadFile

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
        # Cambiar el nombre del archivo
        file_extension = os.path.splitext(file.filename)[1]  # Obtener la extensión del archivo original

        renamed_file = f"{new_name}{file_extension}"  # Combinar el nuevo nombre con la extensión

        # Construir la ruta del archivo
        file_location = os.path.join(root_dir, renamed_file)
        formatted_file_location = format_path(file_location)  # Suponiendo que tienes una función format_path

        # Guardar el archivo
        with open(formatted_file_location, "wb") as f:
            f.write(await file.read())

        saved_file_paths.append(formatted_file_location)

    return saved_file_paths