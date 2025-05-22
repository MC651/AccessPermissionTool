# Access Permission Web Tool
For a deep comprehension of the application read the [notion](https://www.notion.so/Access-Permission-Application-5df343e6cd254715ba68c2ff8acd7088?pvs=4) template 

Execute docker command on the directory where the compose file is located to run the application on a local version, this command allows to replicate the application with local services.


```bash
docker-compose up -d
```

Configure a .env file for the application to work, available on the render application.

Backend .env

```.env
ALGORITHM = ""
COLLECTION = ""
MONGODB_URI = ""
PARENT_FOLDER_ID = ""
REACT_URL = ""
SECRET_KEY = ""
UPLOAD_DIR = ""
```

Frontend .env
```.env
VITE_API_URL = ""
```
The application is hosted on [render.com](https://accesspermissiontool-frontend.onrender.com/login)
