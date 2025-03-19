import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider } from "@mui/material";
import {DeletePurchaseOrderProps, FastAPIError} from "../types";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from 'axios';
import { useState } from "react";
import { useSnackbar } from "../hooks/useSnackbar";
import MessageBar from "../components/MessageBar";

const DeletePurchaseOrder: React.FC<DeletePurchaseOrderProps> = ({ open, handleCloseDeletePurchaseOrder, row }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const {openSnackbar,snackBarMessage,snackbarSeverity,showSnackbar,handleCloseSnackbar} = useSnackbar();

    const handleDeletePurchaseOrder = async (po_number: string) => {
        setIsLoading(true);
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/${po_number}`
            );

            showSnackbar(response.data.message,"success",true)
            setIsDeleted(true);
        }catch (error) {
            showSnackbar((error as FastAPIError)?.response?.data?.detail || "Erro creating Purchase Order","error",true)
            setIsLoading(false);
        }
        finally {
            setTimeout(() => {
                setIsDeleted(false);
                setIsLoading(false);
            }, 1500);
        }
    };


    return (
            <Dialog open={open} onClose={handleCloseDeletePurchaseOrder} maxWidth="sm" fullWidth>
                <DialogContent>
                    <DialogTitle variant="h6" gutterBottom>
                        Delete Purchase Order 
                    </DialogTitle>
                    <Divider/>
                    <Alert severity="error" sx={{ width: '100%' }}>
                        Are you sure you want to delete Purchase Order: {row?.po_number}?
                        This action cannot be undone and will delete all associated access permissions and will be deleted from all associated users.
                    </Alert>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                   

                    <DialogActions>
                        {!isDeleted && !isLoading && (
                        <>
                        <Button onClick={() => row?.po_number && (handleDeletePurchaseOrder(row.po_number))} color="error" variant="contained" endIcon={<DeleteIcon />}>
                            Delete
                        </Button>
                        <Button onClick={handleCloseDeletePurchaseOrder} color="primary" variant="contained" endIcon={<CancelIcon />}>
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

export default DeletePurchaseOrder;
