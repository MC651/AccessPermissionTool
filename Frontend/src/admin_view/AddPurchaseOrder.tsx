import { useState } from "react";
import { CreatePurchaseOrder, DialogComponentProps, plantOptions,FastAPIError } from "../types";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { Alert, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormHelperText, FormLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useSnackbar } from "../hooks/useSnackbar";
import MessageBar from "../components/MessageBar";

const AddPurchaseOrder: React.FC<DialogComponentProps> = ({ open, handleCloseAddPurchaseOrder, fiscal_codes }) => {
  const [isLoading, setLoading] = useState(false);
  const [isOrderCreated, setisOrderCreated] = useState(false);
  const {openSnackbar,snackBarMessage,snackbarSeverity,showSnackbar,handleCloseSnackbar} = useSnackbar();

  const handleClose = () => {
    setLoading(false);
    setisOrderCreated(false);
    handleCloseAddPurchaseOrder();
    reset();
  };

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<CreatePurchaseOrder>();

  const onSubmit = async (data: CreatePurchaseOrder) => {
    setLoading(true);
    const gatesArray = data.purchase_order?.access_permission?.gates?.map((gate) => Number(gate)) || [];
    setValue("purchase_order.access_permission.gates", gatesArray);

    const formattedData = {
      ...data,
      purchase_order: {
        ...data.purchase_order,
        access_permission: data.purchase_order?.access_permission ? [data.purchase_order.access_permission] : []
      }
    };

    console.log(formattedData);
    try {
      const response = await axios.patch(
        `http://localhost:8000/create_purchase_order/`,
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      showSnackbar(response.data.message,"success",true);
      setLoading(false);
      setisOrderCreated(true);
      
    } catch (error) {
      console.log(error);
      showSnackbar((error as FastAPIError)?.response?.data?.detail || "Error creating purchase order","error",true);
      setLoading(false);
      
    } finally {
      setTimeout(() => { 
        showSnackbar("","warning",false);
        setLoading(false);
        setisOrderCreated(false);
      }, 1500);
      reset();
     
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseAddPurchaseOrder} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >Add New Purchase Order</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <FormLabel>Fiscal Codes available</FormLabel>
            <Controller
              name="fiscal_codes"
              control={control}
              rules={{ required: "Fiscal Codes are required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  multiple
                  size="small"
                  fullWidth
                  variant="outlined"
                  displayEmpty
                  defaultValue={[]}
                  renderValue={(selected) =>
                    Array.isArray(selected) && selected.length > 0
                      ? selected.join(', ')
                      : "Select Fiscal Codes" // Mensaje por defecto cuando no hay selección
                  }
                  error={!!errors.fiscal_codes}
                  placeholder="Select Fiscal Codes"
                >
                  <MenuItem value="" disabled>
                    Select Fiscal Codes
                  </MenuItem>
                  {fiscal_codes.map((fiscal_code) => (
                    <MenuItem key={fiscal_code} value={fiscal_code}>
                      {fiscal_code}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors?.fiscal_codes && (
              <FormHelperText error>{errors.fiscal_codes.message}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal">
            <FormLabel >Purchase Order Number</FormLabel>
            <TextField
              size='small'
              {...register("purchase_order.po_number", {
                required: "PO Number is required"
              })}
              placeholder='6705507'
              error={!!errors?.purchase_order?.po_number}
              helperText={errors?.purchase_order?.po_number?.message}
              fullWidth
              variant="outlined"
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <FormLabel>Description</FormLabel>
            <TextField
              size='medium'
              {...register("purchase_order.description", {
                required: "Description is required"
              })}
              placeholder='Description of the Purchase Order'
              error={!!errors.purchase_order?.description}
              helperText={errors.purchase_order?.description?.message}
              fullWidth
              variant="outlined"
            />
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <FormLabel>Locations</FormLabel>
              <Controller
                name="purchase_order.locations"
                control={control}
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    multiple
                    size="small"
                    fullWidth
                    variant="outlined"
                    displayEmpty
                    defaultValue={[]}
                    renderValue={(selected) =>
                      Array.isArray(selected) && selected.length > 0
                        ? selected.join(', ')
                        : "Select Locations" // Mensaje por defecto cuando no hay selección
                    } // Muestra los nombres seleccionados
                    error={!!errors.purchase_order?.locations}
                    placeholder='Select Locations'
                  >
                    <MenuItem value="" disabled>
                      Select Locations
                    </MenuItem>
                    {plantOptions.map((plant) => (
                      <MenuItem key={plant.name} value={plant.name}>
                        {plant.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors?.purchase_order?.locations && (
                <FormHelperText error>{errors.purchase_order.locations.message}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel>Duvri (Check if required)</FormLabel>
              <Controller
                name="purchase_order.duvri"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        sx={{ marginLeft: 0 }} // Alinea el checkbox a la izquierda
                      />
                    }
                    label=""
                    // Deja la etiqueta vacía si no deseas texto
                    sx={{ display: 'flex', alignItems: 'flex-start' }}
                  />
                )}
              />
              {errors.purchase_order?.duvri && (
                <FormHelperText error>{errors?.purchase_order?.duvri.message}</FormHelperText>
              )}
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <FormLabel>Issue Date</FormLabel>
              <TextField
                size='small'
                type="date"
                {...register("purchase_order.issue_date", {
                  required: "Issue date is required"
                })}
                error={!!errors?.purchase_order?.issue_date}
                helperText={errors?.purchase_order?.issue_date?.message}
                fullWidth
                variant="outlined"
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel>Validty End Date</FormLabel>
              <TextField
                size='small'
                type="date"
                {...register("purchase_order.validity_end_date", {
                  required: "Validity End  date is required"
                })}
                error={!!errors?.purchase_order?.validity_end_date}
                helperText={errors?.purchase_order?.validity_end_date?.message}
                fullWidth
                variant="outlined"
              />
            </FormControl>
          </Box>
          <Typography variant="h6" gutterBottom>
            Requester
          </Typography>
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <Box sx={{ display: 'flex', gap: 3 }}>
            <FormControl fullWidth margin="normal">
              <FormLabel>First Name</FormLabel>
              <TextField
                size='small'
                {...register("purchase_order.requester.first_name", {
                  required: "Requester first name is required"
                })}
                error={!!errors.purchase_order?.requester?.first_name}
                helperText={errors.purchase_order?.requester?.first_name?.message}

                fullWidth
                variant="outlined"
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel>Last Name</FormLabel>
              <TextField
                size='small'
                {...register("purchase_order.requester.last_name", {
                  required: "Requester last name is required"
                })}
                error={!!errors.purchase_order?.requester?.last_name}
                helperText={errors.purchase_order?.requester?.last_name?.message}
                fullWidth
                variant="outlined"
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel>Email:</FormLabel>
              <TextField
                size="small"
                type="email"
                {...register("purchase_order.requester.email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9_.+-]+@micla\.info$/,
                    message: "Invalid email",
                  },
                })}
                error={!!errors.purchase_order?.requester?.email}
                helperText={errors.purchase_order?.requester?.email?.message}

                fullWidth
                variant="outlined"
                placeholder='user@micla.info'
              />
            </FormControl>
          </Box>

          <Typography variant="h6" gutterBottom> Subapalto</Typography>
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <FormLabel>Subapalto Number</FormLabel>
              <TextField
                size='small'
                {...register("purchase_order.subapalto.subapalto_number", {
                  required: "Subapalto number is required"
                })}
                error={!!errors.purchase_order?.subapalto?.subapalto_number}
                helperText={errors.purchase_order?.subapalto?.subapalto_number?.message}

                fullWidth
                variant="outlined"
                placeholder='4548645'
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel>Subapalto Status</FormLabel>
              <Select
                size="small"
                {...register("purchase_order.subapalto.subapalto_status",
                  { required: "Subapalto status is required" })}
                error={!!errors.purchase_order?.subapalto?.subapalto_status}
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
              {errors.purchase_order?.subapalto?.subapalto_status && (
                <FormHelperText error>{errors.purchase_order.subapalto.subapalto_status.message}</FormHelperText>
              )}
            </FormControl>
          </Box>
              <Typography variant="h6" gutterBottom> Access Permission</Typography>
              <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth margin="normal">
                  <FormLabel>Protocol Number</FormLabel>
                  <TextField
                    size='small'
                    {...register("purchase_order.access_permission.protocol_number", {
                      required: "Protocol number is required"
                    })}
                    error={!!errors.purchase_order?.access_permission?.protocol_number}
                    helperText={errors.purchase_order?.access_permission?.protocol_number?.message}

                    fullWidth
                    variant="outlined"
                    placeholder='2024-163746-E'
                  />
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <FormLabel>Plant</FormLabel>
                  <TextField
                    size='small'
                    {...register("purchase_order.access_permission.plant", {
                      required: "Plant is required",
                    })}
                    error={!!errors.purchase_order?.access_permission?.plant}
                    helperText={errors.purchase_order?.access_permission?.plant?.message}
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
                    {...register("purchase_order.access_permission.status", {
                      required: "Status is required",
                    })}
                    error={!!errors.purchase_order?.access_permission?.status}
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
                  {errors.purchase_order?.access_permission?.status && (
                    <FormHelperText error>{errors.purchase_order.access_permission.status.message}</FormHelperText>

                  )}
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <FormLabel>Validity End Date</FormLabel>
                  <TextField
                    size='small'
                    type="date"
                    {...register("purchase_order.access_permission.validity_end_date", {
                      required: "Validity End Date is required",
                    })}
                    error={!!errors.purchase_order?.access_permission?.validity_end_date}
                    helperText={errors.purchase_order?.access_permission?.validity_end_date?.message}

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
                    {...register("purchase_order.access_permission.address", {
                      required: "Address is required",
                    })}
                    error={!!errors.purchase_order?.access_permission?.address}
                    helperText={errors.purchase_order?.access_permission?.address?.message}
                    fullWidth
                    variant="outlined"
                    placeholder='P.za Riccardo Cattaneo, 9, 10137 Torino TO, Italy'
                  />
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <FormLabel>Gates (separated by commas)</FormLabel>
                  <Controller
                    name="purchase_order.access_permission.gates"
                    control={control}
                    defaultValue={[]}
    
                    rules={{
                      required: "Gates are required",
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        variant="outlined"
                        placeholder="e.g., 1, 2, 3"
                        onChange={(e) => field.onChange(e.target.value.split(',').map(Number))}
                      />
                    )}
                  />
                  {errors.purchase_order?.access_permission?.gates && (
                    <FormHelperText error>{errors.purchase_order.access_permission.gates.message}</FormHelperText>
                  )}
                </FormControl>
              </Box>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <DialogActions sx={{ alignItems: 'center' }}>
            {!isOrderCreated && !isLoading && (
              <Button type="submit" color="primary" variant="contained" endIcon={<SaveIcon />}>
                Save
              </Button>
            )}
            {isLoading && (
              <CircularProgress />
            )}
            {isOrderCreated && (
              <Alert severity="success">Order created successfully</Alert>
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
}

export default AddPurchaseOrder;