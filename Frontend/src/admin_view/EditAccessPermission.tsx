 // @ts-nocheck
import React, { useEffect, useState } from "react";
import { EditTableProps, FastAPIError, Row } from "../types";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, FormLabel, MenuItem, Select, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from 'axios'
import { useSnackbar } from "../hooks/useSnackbar";
import MessageBar from "../components/MessageBar";



const EditAccessPermission: React.FC<EditTableProps> = ({ open, handleCloseEditTable, row }) => {
  console.log(row);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const {openSnackbar,snackBarMessage,snackbarSeverity,showSnackbar,handleCloseSnackbar} = useSnackbar();


  const { register, handleSubmit, reset, control, formState: { errors, dirtyFields }, } = useForm<Row>();
  console.log(dirtyFields);
  const onSubmit = async (data: Row) => {
    setIsLoading(true);
    if (Object.keys(dirtyFields).length === 0) {
      showSnackbar("You haven't modified any field","warning",true)
      setIsLoading(false);
      return;
    }
    // Create an updated object by filtering dirty fields and assigning new values
    const updatedFields: Partial<Row> = {};

    // Loop over dirtyFields and add the modified fields to updatedFields
    Object.keys(dirtyFields).forEach((key) => {
      if (key in data) {
        const field = key as keyof Row;
  
        // Check if the field value is not undefined
        const fieldValue = data[field];
        if (fieldValue !== undefined) {
          updatedFields[field] = fieldValue;
        }
      }
    });

    const formattedData = {
      ...updatedFields,
      validity_end_date: data.access_permission_validity_end_date ? new Date(data.access_permission_validity_end_date).toISOString().split("T")[0] : "",
    };
    delete formattedData.access_permission_validity_end_date;
    //console.log(formattedData);
    try {
      //console.log(formattedData);
      const response = await axios.patch(
        `http://localhost:8000/update_access_permission/${row?.po_number}/${row?.protocol_number}`,
        formattedData,
        {
          headers : {
            "Content-Type": "application/json"
          }
        }
      );
      showSnackbar(response.data.message,"success",true)
      setIsLoading(false);
      setIsUpdated(true);
    }
    catch (error) {
      showSnackbar((error as FastAPIError)?.response?.data?.detail || "Error Updating Access Permission","error",true)
      setIsLoading(false);
    }
    finally {
      setTimeout(() => {
        showSnackbar("","warning",false)
        setIsUpdated(false);
      }, 2000);
      reset();
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
        requester_first_name: row.first_name || "",
        requester_last_name: row.last_name || "",
        requester_email: row.requester_email || "",
        protocol_number: row.protocol_number || "",
        plant: row.plant || "",
        status: row.status || "",
        access_permission_validity_end_date: row.access_permission_validity_end_date ? new Date(row.access_permission_validity_end_date).toISOString().split("T")[0] : "",
        purchase_order_validity_end_date: row.purchase_order_validity_end_date ? new Date(row.purchase_order_validity_end_date).toISOString().split("T")[0] : "",
        address: row.address || "",
        gates: row.gates || [],
        subapalto_number: row.subapalto_number || "",
        subapalto_status: row.subapalto_status || "",
      });
    }
  }, [row, reset]); 

  return (
    <Dialog open={open} onClose={handleCloseEditTable} maxWidth="md" fullWidth>
      <DialogTitle>Edit Access Permission</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <FormLabel>Associated Purchase Order Number</FormLabel>
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                value={row?.po_number}
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel>Description</FormLabel>
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                value={row?.description}
              />
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <FormLabel>Protocol Number</FormLabel>
              <TextField
                size='small'
                {...register("protocol_number")}
                error={!!errors.protocol_number}
                helperText={errors.protocol_number?.message}
                fullWidth
                variant="outlined"
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel>Plant</FormLabel>
              <TextField
                size='small'
                {...register("plant")}
                error={!!errors.plant}
                helperText={errors.plant?.message}
                fullWidth
                variant="outlined"
              />
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth margin="normal">
              <FormLabel>Status</FormLabel>
              <Select
                size="small"
                {...register("status",
                  { required: "Access permission status is required" })}
                error={!!errors.status}
                displayEmpty
                fullWidth
                variant="outlined"
              >
                <MenuItem disabled>
                  Previous Status: {row?.status}
                </MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Requested">Requested</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
              {errors.status && (
                <FormHelperText error>{errors.status.message}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel>Validity End Date</FormLabel>
              <TextField
                size='small'
                type="date"
                {...register("access_permission_validity_end_date", {
                  required: "Validity end date is required",
                  validate: (value) => {
                    const validity_end_date = new Date(value);
                    const today = new Date();
                    return validity_end_date > today || "Validity end date must be greater than today";
                  }
                })}
                error={!!errors.access_permission_validity_end_date}
                helperText={errors.access_permission_validity_end_date?.message}
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
                {...register("address", {
                  required: "Address is required"
                })}
                error={!!errors.address}
                helperText={errors.address?.message}
                fullWidth
                variant="outlined"
                placeholder='P.za Riccardo Cattaneo, 9, 10137 Torino TO, Italy'
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel>Gates (separated by commas)</FormLabel>
              <Controller
                name="gates"
                control={control}
                defaultValue={[]}
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
              {errors.gates && (
                <FormHelperText error>{errors.gates.message}</FormHelperText>
              )}
            </FormControl>
          </Box>
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
            <Button onClick={handleCloseEditTable} color="primary" variant="contained" endIcon={<CancelIcon />}>
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

export default EditAccessPermission;