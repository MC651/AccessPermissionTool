import React, { useEffect, useState,useRef } from "react";
import { Row, EditPurchaseOrderProps, plantOptions } from "../types";
import {Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormHelperText, FormLabel, MenuItem, Select, Snackbar, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from 'axios'
import { useSnackbar } from "../hooks/useSnackbar";
import MessageBar from "../components/MessageBar";

const EditPurchaseOrder: React.FC<EditPurchaseOrderProps> = ({ open, handleCloseEditPurchaseOrder, row }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const {openSnackbar,snackBarMessage,snackbarSeverity,showSnackbar,handleCloseSnackbar} = useSnackbar();
    const [addUser,setAddUser] = useState(false);
    const pattern = /^[A-Z]{6}[0-9]{2}[A-Z]{1}[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{1}$/;
    const fiscalCodeRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, control,watch, formState: { errors, dirtyFields }, } = useForm<Row>();

    const issueDate = watch("issue_date");
    const handleAddUser = async (fiscal_code: string) => {
      setIsLoading(true);
      
      if (fiscal_code === "" || fiscal_code === undefined) {
        showSnackbar("Fiscal Code is required","warning",true)
        setIsLoading(false);
        return;
      }

      else if (!pattern.test(fiscal_code)) {
        showSnackbar("Fiscal Code format incorrect","warning",true)
        setIsLoading(false);
        return;
      }

      const actualPO = transformData(row!);
      console.log(actualPO);
      const allData = {
        ...actualPO,
        access_permission: []
      }
      console.log(allData);
      try {
       const response = await axios.patch(
          `http://localhost:8000/insert_purchase_order/${fiscal_code}`,
          allData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        ); 
        showSnackbar(response.data.message,"success",true);
        setIsLoading(false);
        setIsAdded(true);
      }
      catch (error) {
        showSnackbar(error?.response?.data?.detail,"error",true);
        setIsLoading(false);
      }
      finally {
        setTimeout(() => {
          setIsAdded(false);
          setIsLoading(false);
          showSnackbar("","warning",false);
        }, 1500);
      }
    };

    const onButtonClick = () => {
      handleAddUser(fiscalCodeRef.current?.value || "");
    };

    
  const transformData = (data: Row) => ({
    po_number: data.po_number,
    description: data.description,
    issue_date: data.issue_date ? new Date(data.issue_date).toISOString() : undefined,
    validity_end_date: data.purchase_order_validity_end_date ? new Date(data.purchase_order_validity_end_date).toISOString() : undefined,

    requester: {
      email: data.requester_email,
      first_name: data.requester_first_name,
      last_name: data.requester_last_name
    },

    locations: data.locations?.length ? data.locations : undefined,
    duvri: data.duvri,

    subapalto: {
      subapalto_number: data.subapalto_number,
      subapalto_status: data.subapalto_status
    }
  });

  // Remover campos vacíos del objeto resultante
  const cleanData = (data: Row) => {
    Object.keys(data).forEach(
      (key) => data[key] === undefined || (typeof data[key] === 'object' && Object.keys(data[key]).length === 0)
        && delete data[key]
    );
    return data;
  };

    const onSubmit = async (data: Row) => {
        setIsLoading(true);

        if (Object.keys(dirtyFields).length === 0) {
            showSnackbar("You haven't modified any field.","warning",true)
            setIsLoading(false);
            return;
        }

        const updatedFields = Object.keys(dirtyFields).reduce((acc, key) => {
            const field = key as keyof Row;
            acc[field] = data[field];
            return acc;
        }, {} as Partial<Row>);


        const transformedData = cleanData(transformData(updatedFields));
        console.log(transformedData);

        try {
            console.log(updatedFields);
            const response = await axios.patch(
              `http://localhost:8000/update_purchase_order/${row?.po_number}`,
              transformedData,
              {
                headers : {
                  "Content-Type": "application/json"
                }
              }
            ); 
            console.log(response);
            showSnackbar(response.data.message,"success",true);
            setIsLoading(false);
            setIsUpdated(true);
        }
        catch (error) {
            showSnackbar(error?.response.data?.detail || "Error Updating Purchase Order","error",true);
            setIsLoading(false);
            console.error("Error:", error);
        }
        finally {
            setTimeout(() => {
                showSnackbar("","warning",false);
               
                setIsUpdated(false);
            }, 2000);
           
        }
    };

    useEffect(() => {
        if (row) {
            reset({
                fiscal_code: row.fiscal_code || "",
                first_name: row.first_name || "",
                last_name: row.last_name || "",
                contract_validity_start_date: row.contract_validity_start_date ? new Date(row.contract_validity_start_date).toISOString().split("T")[0] : "",
                contract_validity_end_date: row.contract_validity_end_date ? new Date(row.contract_validity_end_date).toISOString().split("T")[0] : "",
                po_number: row.po_number || "",
                description: row.description || "",
                issue_date: row.issue_date ? new Date(row.issue_date).toISOString().split("T")[0] : "",
                requester_first_name: row.requester_first_name || "",
                requester_last_name: row.requester_last_name || "",
                requester_email: row.requester_email || "",
                protocol_number: row.protocol_number || "",
                plant: row.plant || "",
                status: row.status || "",
                purchase_order_validity_end_date: row.purchase_order_validity_end_date ? new Date(row.purchase_order_validity_end_date).toISOString().split("T")[0] : "",
                access_permission_validity_end_date: row.access_permission_validity_end_date ? new Date(row.access_permission_validity_end_date).toISOString().split("T")[0] : "",
                address: row.address || "",
                gates: row.gates || [],
                subapalto_number: row.subapalto_number || "",
                subapalto_status: row.subapalto_status || "",
                locations: row.locations || [],
                duvri: row.duvri || false,
            });
        }
    }, [row, reset]);
    return (
        <>
            <Dialog open={open} onClose={handleCloseEditPurchaseOrder} maxWidth="md" fullWidth>
                <DialogTitle>Edit Purchase Order</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <FormControl fullWidth margin="normal">
                            <FormLabel >Purchase Order Number</FormLabel>
                            <TextField
                                size='small'
                                {...register("po_number")}
                                error={!!errors?.po_number}
                                helperText={errors?.po_number?.message}
                                fullWidth
                                variant="outlined"
                            />
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <FormLabel>Description</FormLabel>
                            <TextField
                                size='medium'
                                {...register("description", {
                                    required: "Description is required"
                                })}
                                placeholder='Description of the Purchase Order'
                                error={!!errors.description}
                                helperText={errors.description?.message}
                                fullWidth
                                variant="outlined"
                            />
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Locations</FormLabel>
                <Controller
                  name="locations"
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
                      renderValue={(selected) => selected.join(',') || "Select Locations"} // Muestra los nombres seleccionados
                      error={!!errors.locations}
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
                {errors?.locations && (
                  <FormHelperText error>{errors.locations.message}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth margin="normal">
                <FormLabel>Duvri (Check if required)</FormLabel>
                <Controller
                  name="duvri"
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
                {errors.duvri && (
                  <FormHelperText error>{errors?.duvri.message}</FormHelperText>
                )}
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Issue Date</FormLabel>
                <TextField
                  size='small'
                  type="date"
                  {...register("issue_date", {
                    required: "Issue date is required",
                    validate: (value) => {
                      const issue_date = new Date(value);
                      const today = new Date();
                      issue_date.setHours(0,0,0,0);
                      today.setHours(0,0,0,0);
                      return issue_date >= today || "Issue date must greater or equal than today";
                    },
                  })}
                  error={!!errors?.issue_date}
                  helperText={errors?.issue_date?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <FormLabel>Validty End Date</FormLabel>
                <TextField
                  size='small'
                  type="date"
                  {...register("purchase_order_validity_end_date", {
                    required: "Validity End  date is required",
                    validate: (value) => {
                      const purchase_order_validity_end_date = new Date(value);
                      const issuedDate = new Date(issueDate);
                      return purchase_order_validity_end_date > issuedDate || "Validity End date must be in the future";
                    },
                  })}
                  error={!!errors?.purchase_order_validity_end_date}
                  helperText={errors?.purchase_order_validity_end_date?.message}
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
                  {...register("requester_first_name", {
                    required: "Requester first name is required"
                  })}
                  error={!!errors.requester_first_name}
                  helperText={errors.requester_first_name?.message}
      
                  fullWidth
                  variant="outlined"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <FormLabel>Last Name</FormLabel>
                <TextField
                  size='small'
                  {...register("requester_last_name", {
                    required: "Requester last name is required"
                  })}
                  error={!!errors.requester_last_name}
                  helperText={errors.requester_last_name?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <FormLabel>Email:</FormLabel>
                <TextField
                  size="small"
                  type="email"
                  {...register("requester_email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9_.+-]+@micla\.info$/,
                      message: "Invalid email",
                    },
                  })}
                  error={!!errors.requester_email}
                  helperText={errors.requester_email?.message}
                  
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
                  {...register("subapalto_number", {
                    required: "Subapalto number is required"
                  })}
                  error={!!errors.subapalto_number}
                  helperText={errors.subapalto_number?.message}
        
                  fullWidth
                  variant="outlined"
                  placeholder='2500699509-S01'
                />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <FormLabel>Subapalto Status</FormLabel>
                <Select
                  size="small"
                  {...register("subapalto_status",
                    { required: "Subapalto is required" })}
                  error={!!errors.subapalto_status}
                  displayEmpty
                  fullWidth
                  variant="outlined"
                >
                  <MenuItem disabled>
                    Previous Status: { row?.subapalto_status}
                  </MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Requested">Requested</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
                {errors.subapalto_status && (
                  <FormHelperText error>{errors.subapalto_status?.message}</FormHelperText>
                )}

              </FormControl>
              
            </Box>
            <Button onClick={() => setAddUser(!addUser)} variant="contained" color="primary" sx={{marginTop:3}}>Add User to PO</Button>
              {addUser && (
                 <Box sx={{ display: "flex", gap: 2 }}>
                 <TextField
                   sx={{ marginTop: 3 }}
                   size="small"
                   variant="outlined"
                   inputRef={fiscalCodeRef}
                   label="Fiscal Code"
                   required={true}
            
                 />
                 {!isAdded && (
                 <Button 
                   type="button"
                   onClick={onButtonClick} // Llamada a la función separada en vez de una función flecha
                   variant="contained" 
                   color="primary" 
                   size="small" 
                   sx={{ marginTop: 3 }}
                 >
                   Add User
                 </Button>
                 )}
               </Box>
              )}
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <DialogActions sx={{ alignItems: 'center' }}>
            {!isLoading && !isUpdated && (
              <Button type="submit" color="primary" variant="contained" endIcon={<SaveIcon />}>
                Save
              </Button>
            )}
            {isLoading && (
              <CircularProgress />
            )}
            <Button onClick={handleCloseEditPurchaseOrder} color="primary" variant="contained" endIcon={<CancelIcon />}>
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
        </>
    );
};

export default EditPurchaseOrder;