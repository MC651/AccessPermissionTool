import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider } from "@mui/material";
import { DeleteUserProps, FastAPIError } from "../types";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from 'axios';
import { useState } from "react";
import { useSnackbar } from "../hooks/useSnackbar";
import MessageBar from "../components/MessageBar";


const DeleteUser: React.FC<DeleteUserProps> = ({ open, handleCloseDeleteUser, row }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const {openSnackbar,snackBarMessage,snackbarSeverity,showSnackbar,handleCloseSnackbar} = useSnackbar();
    
    const handleDeleteUser = async (fiscal_code: string) => {
        setIsLoading(true);
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/delete/${fiscal_code}`
            );
            
            showSnackbar(response.data.message,"success",true)
            setIsLoading(false);
            setIsDeleted(true);
        }catch (error) {
            showSnackbar((error as FastAPIError)?.response?.data?.detail || "Error deleting User","error",true)
            setIsLoading(false);
        }
        finally {
            setTimeout(() => {
                showSnackbar("","warning",false)
                setIsDeleted(false);
                setIsLoading(false);
            }, 1500);
        }
    };


    return (
            <Dialog open={open} onClose={handleCloseDeleteUser} maxWidth="sm" fullWidth>
                <DialogContent>
                    <DialogTitle variant="h6" gutterBottom>
                        Delete User
                    </DialogTitle>
                    <Divider/>
                    <Alert severity="error" sx={{ width: '100%' }}>
                        Are you sure you want to delete employee with fiscal code: {row?.fiscal_code}?
                        This action cannot be undone.
                    </Alert>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>

                    <DialogActions>
                        {!isDeleted && !isLoading && (
                        <>
                        <Button onClick={() => row?.fiscal_code && (handleDeleteUser(row.fiscal_code))} color="error" variant="contained" endIcon={<DeleteIcon />}>
                            Delete
                        </Button>
                        <Button onClick={handleCloseDeleteUser} color="primary" variant="contained" endIcon={<CancelIcon />}>
                            Cancel
                        </Button>
                        </>
                        )}
                        {isLoading && (
                        <CircularProgress />
                        )}
                    </DialogActions>
                    </Box>
                </DialogContent>
                <MessageBar
              openSnackbar={openSnackbar}
              autoHideDuration={2000}
              snackBarMessage={snackBarMessage}
              snackbarSeverity={snackbarSeverity}
              handleCloseSnackbar={handleCloseSnackbar}  
              vertical="bottom"
              horizontal="center"
            />
            </Dialog>
    );
}

export default DeleteUser