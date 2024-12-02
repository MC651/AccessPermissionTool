import os
from fastapi import UploadFile

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

async def save_files(files: list[UploadFile], file_names: list[str], root_dir: str) -> list[str]:
    """
    Saves a list of files in the specified directory with custom names and returns the file paths.
    Args:
        files (list[UploadFile]): The files to be saved.
        file_names (list[str]): The custom names for the files.
        root_dir (str): The root directory where the files will be saved.
    Returns:
        list[str]: The file paths of the saved files.
    """
    if not files:
        raise ValueError("No files provided")
    
    if len(files) != len(file_names):
        raise ValueError("The number of files does not match the number of file names provided.")
    
    saved_file_paths = []

    for file, new_name in zip(files, file_names):
       
        file_extension = os.path.splitext(file.filename)[1]  # Obtain the file extension of the original file

        renamed_file = f"{new_name}{file_extension}"  # Combine the new name with the file extension

        # Build the file path
        file_location = os.path.join(root_dir, renamed_file)
        formatted_file_location = format_path(file_location)  #Format the file path

        # Save the file
        with open(formatted_file_location, "wb") as f:
            f.write(await file.read())
        
        saved_file_paths.append(formatted_file_location)

    return saved_file_paths