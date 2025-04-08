import { Box,Button,CircularProgress,Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, FormLabel, MenuItem, Select, TextField } from '@mui/material';
import { AccessPermisionDialogComponentProps, CreateAccesPermission,FastAPIError} from '../types';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from 'axios';
import { useSnackbar } from "../hooks/useSnackbar";
import MessageBar from "../components/MessageBar";



const AddAccessPermission: React.FC<AccessPermisionDialogComponentProps> = ({ open, handleCloseAccessPermission, fiscal_codes_with_purchase_orders }) => {
    const [selectedFiscalCode, setSelectedFiscalCode] = useState<string | null>(null);
    const [isLoading,setIsLoading] = useState(false);
    const [isAccessPermissionCreated,setIsAccessPermissionCreated] = useState(false);
    const {openSnackbar,snackBarMessage,snackbarSeverity,showSnackbar,handleCloseSnackbar} = useSnackbar();

    const handleClose = () => {
        setIsLoading(false);
        setIsAccessPermissionCreated(false);
        handleCloseAccessPermission();
        reset();
    };

    const { register, handleSubmit, reset, setValue, control,watch, formState: { errors } } = useForm<CreateAccesPermission>();

    const fiscalCode = watch('fiscal_code');

    const onSubmit = async (data: CreateAccesPermission) => {
        //console.log("DATA", data);
        setIsLoading(true);
        delete data.fiscal_code;
        //console.log(data);
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/insert_access_permission/${fiscalCode}`,
                data,
                {
                    headers : {
                        "Content-Type":"application/json"
                    }
                }
            );
            //console.log(response);
            showSnackbar(response.data.message,"success",true);
            setIsLoading(false);
            setIsAccessPermissionCreated(true);
            
        } catch (error) {
            showSnackbar((error as FastAPIError)?.response?.data?.detail || "Error creating access permission","error",true);
            //console.log("Error", error);
        } finally {
            setTimeout (() => {
                showSnackbar("","warning",false);
                setIsLoading(false);
                setIsAccessPermissionCreated(false);
            }, 2000);
            reset();
        }
    };
    
    return (
        <Dialog open={open} onClose={handleCloseAccessPermission} maxWidth="md" fullWidth>
            <DialogTitle>
                Add New Access Permission
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <FormLabel>Fiscal Code available</FormLabel>
                        <Controller
                            name="fiscal_code"
                            control={control}
                            defaultValue=""
                            rules={{ required: "Fiscal Code is required" }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    size="small"
                                    fullWidth
                                    variant="outlined"
                                    displayEmpty
                                    value={field.value || ""}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        field.onChange(value);
                                        setSelectedFiscalCode(value); // Guarda el fiscal_code seleccionado
                                        setValue("po_numbers", []); // Limpia el valor del po_number al cambiar el fiscal_code
                                    }}
                                    renderValue={(selected) => (selected ? selected : 'Select Fiscal Code')}
                                    error={!!errors.fiscal_code}
                                    placeholder="Select Fiscal Code"
                                >
                                    <MenuItem value="" disabled>
                                        Select Fiscal Code
                                    </MenuItem>
                                    {Object.keys(fiscal_codes_with_purchase_orders).map((fiscalCode) => (
                                        <MenuItem key={fiscalCode} value={fiscalCode}>
                                            {fiscalCode}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors?.fiscal_code && (
                            <FormHelperText error>{errors.fiscal_code.message}</FormHelperText>
                        )}
                    </FormControl>

                    {selectedFiscalCode && (
                        <FormControl fullWidth margin="normal">
                            <FormLabel>PO Numbers for {selectedFiscalCode}</FormLabel>
                            <Controller
                                name="po_numbers"
                                control={control}
                                defaultValue={[]}
                                rules={{ required: "At least one PO Number is required" }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        multiple
                                        size="small"
                                        fullWidth
                                        variant="outlined"
                                        displayEmpty
                                        value={Array.isArray(field.value) ? field.value : []} // Asegura que value es un array
                                        onChange={(event) => {
                                            const value = event.target.value as string[];
                                            field.onChange(value); // Actualiza el array de PO numbers seleccionados
                                        }}
                                        renderValue={(selected) => {
                                            // Verifica si selected es un array antes de aplicar join
                                            return Array.isArray(selected) && selected.length > 0
                                                ? selected.join(", ")
                                                : "Select PO Numbers";
                                        }}
                                        error={!!errors.po_numbers}
                                        placeholder="Select PO Numbers"
                                    >
                                        {fiscal_codes_with_purchase_orders[selectedFiscalCode]?.map((poNumber) => (
                                            <MenuItem key={poNumber} value={poNumber}>
                                                {poNumber}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors?.po_numbers && (
                                <FormHelperText error>{errors.po_numbers.message}</FormHelperText>
                            )}
                        </FormControl>
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Protocol Number</FormLabel>
                            <TextField
                                size='small'
                                {...register("access_permission.protocol_number", {
                                    required: "Protocol number is required"
                                })}
                                error={!!errors.access_permission?.protocol_number}
                                helperText={errors.access_permission?.protocol_number?.message}
                                fullWidth
                                variant="outlined"
                                placeholder='2024-163746-E'
                            />
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Plant</FormLabel>
                            <TextField
                                size='small'
                                {...register("access_permission.plant", {
                                    required: "Plant is required"
                                })}
                                error={!!errors.access_permission?.plant}
                                helperText={errors.access_permission?.plant?.message}
                                fullWidth
                                variant="outlined"
                                placeholder='Mirafiori'
                            />
                        </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Status</FormLabel>
                            <Select
                                size="small"
                                {...register("access_permission.status",
                                    { required: "Access permission status is required" })}
                                error={!!errors.access_permission?.status}
                                displayEmpty
                                fullWidth
                                variant="outlined"
                            >
                                <MenuItem disabled>
                                    -- Select Status --
                                </MenuItem>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Requested">Requested</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                            {errors.access_permission?.status && (
                                <FormHelperText error>{errors.access_permission?.status.message}</FormHelperText>

                            )}
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Validity End Date</FormLabel>
                            <TextField
                                size='small'
                                type="date"
                                {...register("access_permission.validity_end_date", {
                                    required: "Validity end date is required",
                                    validate: (value) => {
                                        const validity_end_date = new Date(value);
                                        const today = new Date();
                                        return validity_end_date > today || "Validity end date must be greater than today";
                                    }
                                })}
                                error={!!errors.access_permission?.validity_end_date}
                                helperText={errors.access_permission?.validity_end_date?.message}
                                fullWidth
                                variant="outlined"
                            />
                        </FormControl>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Address</FormLabel>
                            <TextField
                                size='medium'
                                {...register("access_permission.address", {
                                    required: "Address is required"
                                })}
                                error={!!errors. access_permission?.address}
                                helperText={errors.access_permission?.address?.message}

                                fullWidth
                                variant="outlined"
                                placeholder='P.za Riccardo Cattaneo, 9, 10137 Torino TO, Italy'
                            />
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Gates (separated by commas)</FormLabel>
                            <Controller
                                name="access_permission.gates"
                                control={control}
                                defaultValue={[]}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        size="small"
                                        variant="outlined"
                                        placeholder="e.g., 1, 2, 3"
                                        onChange={(e) => field.onChange(e.target.value.split(',').map(Number))}
                                        error={!!errors.access_permission?.gates}
                                    />
                                )}
                            />
                            {errors.access_permission?.gates && (
                                <FormHelperText error>{errors.access_permission?.gates.message}</FormHelperText>
                            )}
                        </FormControl>
                    </Box>

                </DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                    <DialogActions sx={{ alignItems: 'center' }}>
                        {!isAccessPermissionCreated && !isLoading && (
                            <Button type="submit" color="primary" variant="contained" endIcon={<SaveIcon />}>
                                Save
                            </Button>
                        )}
                        {isLoading && (
                            <CircularProgress />
                        )}
                        <Button onClick={handleClose} color="primary" variant="contained" endIcon={<CancelIcon />}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Box>
                <MessageBar
              openSnackbar={openSnackbar}
              autoHideDuration={2000}
              snackBarMessage={snackBarMessage}
              snackbarSeverity={snackbarSeverity}
              handleCloseSnackbar={handleCloseSnackbar}  
              vertical="bottom"
              horizontal="center"
            />
            </form>
        </Dialog>
    );
};

export default AddAccessPermission;
