# Backend Configuration
The backend of this application is structured into the following components:

- Models: Pydantic models designed for data validation and deserialization when interacting with MongoDB.
- DAL (Data Access Layer): Functions responsible for processing client data, storing it in MongoDB, and retrieving it for use in endpoints.
- Routes: Endpoints that handle incoming requests from the client side, process the data, and return appropriate responses.

## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install the dependencies.

```bash
pip install -r requeriments.txt
```
## Usage (Dev Stage)
```bash
fastapi dev main.py
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
