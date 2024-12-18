import { Avatar, Stack } from "@mui/material";

const fiscalCode = localStorage.getItem("fiscal_code")

export default function ToolBarImage () {
    const url = `http://localhost:8000/retrieve_files/${fiscalCode}/` 
    return (
        <Stack direction="row" spacing={2}>
             <Avatar src={url} />
        </Stack>

    );
}