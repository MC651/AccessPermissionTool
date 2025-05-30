 import React, { useState } from "react";
import { useEmployee } from "../contexts/EmployeeContext";
import { useForm } from "react-hook-form";
import { Employee, FastAPIError,EditEmployeeProps } from "../types";
import axios from "axios";
import { TextField, Button, Box, Typography, MenuItem, Container, Divider, FormControl, FormLabel, CircularProgress, Select,Dialog,DialogContent, DialogActions } from "@mui/material";
import Loading from "../components/Loading";
import { useSnackbar } from "../hooks/useSnackbar";
import MessageBar from "../components/MessageBar";
import FileUploadField from "../register/FileInput";

const EditInformation: React.FC<EditEmployeeProps> = ({ open, handleCloseEditTable }) => {
  
  const { loaded, employee } = useEmployee(); 
  const {openSnackbar,snackBarMessage,snackbarSeverity,showSnackbar,handleCloseSnackbar} = useSnackbar();
  const [setLoading, setIsLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const handleClose = () => {
    setIsLoading(false);
    setIsUpdated(false);
    handleCloseEditTable();
  };

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    watch,
    control,
    setValue
  } = useForm<Employee>({
    defaultValues: {
      first_name: employee?.first_name || "",
      last_name: employee?.last_name || "",
      birth_date: employee?.birth_date ? new Date(employee?.birth_date).toISOString().split("T")[0] : "",
      id_card_end_date: employee?.id_card_end_date ? new Date(employee?.id_card_end_date).toISOString().split("T")[0] : "",
      contract_type: employee?.contract_type || "",
      contract_validity_start_date: employee?.contract_validity_start_date ? new Date(employee?.contract_validity_start_date).toISOString().split("T")[0] : "",
      contract_validity_end_date: employee?.contract_validity_end_date ? new Date(employee?.contract_validity_end_date).toISOString().split("T")[0] : "",
      visa_start_date: employee?.visa_start_date ? new Date(employee?.visa_start_date).toISOString().split("T")[0] : "",
      visa_end_date: employee?.visa_end_date ? new Date(employee?.visa_end_date).toISOString().split("T")[0] : "",
      user_credentials: {
        email: employee?.user_credentials?.email || "",
        user_name: employee?.user_credentials?.user_name || "",
        password: employee?.user_credentials?.password || "",
        user_type: employee?.user_credentials?.user_type || "",
      },
      profile_image:null,
      id_card:null,
      visa:null,
      unilav:null
    }
  });

  const hasPreviousVisa = !!employee?.visa_path;
  const contractStartDate = watch("contract_validity_start_date");
  const visaStartDate = watch("visa_start_date");
  const hasDirtyFields = Object.keys(dirtyFields).length > 0;
  const hasNewProfileImage = !!watch("profile_image");
  const hasNewIdCard = !!watch("id_card");
  const hasNewVisa  = !!watch("visa");
  const hasNewUnilav  = !!watch("unilav");
  const isButtonDisabled = !(hasDirtyFields || hasNewProfileImage || hasNewIdCard || hasNewVisa || hasNewUnilav);

  //console.log(dirtyFields);
  

  const onSubmit = handleSubmit(async (data: Employee) => {
  setIsLoading(true);
  //console.log(data);
  
  const updatedFields = Object.keys(dirtyFields).reduce((acc, key) => {
    const field = key as keyof Employee;
    if (dirtyFields[field]) {
      (acc[field] as unknown) = data[field];
    }
    return acc;
  }, {} as Partial<Employee>);

  if (hasNewProfileImage) {
    updatedFields.profile_image = data.profile_image; 
  }

  if (hasNewIdCard) {
    updatedFields.id_card = data.id_card;
  }

  if (hasNewVisa) {
    updatedFields.visa = data.visa;
  }
  if (hasNewUnilav) {
    updatedFields.unilav = data.unilav;
  }


  // Crear FormData
  const formData = new FormData();
  for (const key in updatedFields) {
  const value = updatedFields[key as keyof Employee];

  // Verifica si es un archivo
  if (key === "profile_image" && value instanceof File) {
    formData.append(key, value);
  } 
  else if (key === "visa" && value instanceof File) {
    formData.append(key, value);
  }
  else if (key === "unilav" && value instanceof File) {
    formData.append(key, value);
  }
  else if (key === "id_card" && value instanceof File) {
    formData.append(key, value);
  }
  else if (key === "user_credentials" && typeof value === "object") {
    formData.append(key, JSON.stringify(value));
  } else {
    formData.append(key, String(value));
    }
  }

    try { 
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/update/${employee?.fiscal_code}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form/data",
          },
        }
      );
      showSnackbar(response.data.message,"success",true);
      setIsLoading(false);
      setIsUpdated(true);
      //console.log(response)
      //reset();
    } catch (error) {
      showSnackbar((error as FastAPIError)?.response?.data?.detail || "Error updating data","error",true);
      setIsLoading(false);
      //console.log(error)
      //console.log(error)
    } finally {
      setTimeout(() => {
        showSnackbar("","warning",false);
        setIsLoading(false);
        setIsUpdated(false);
      }, 1500);
    }
  });

  return !loaded ? (
    employee ? (
      <Dialog open={open} onClose={handleCloseEditTable} maxWidth="lg" fullWidth>
      <Container maxWidth="lg">
        <Box sx={{ paddingmargin: "auto", marginTop: 3, marginBottom: 3,padding:6 }}>
          <Typography variant="h4" gutterBottom textAlign={"center"}>
            Edit Information
          </Typography>
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <form onSubmit={onSubmit}>
            <DialogContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth margin="normal">
                <FormLabel>First Name:</FormLabel>
                <TextField
                  size="small"
                  {...register("first_name", { maxLength: 20, minLength: 2 })}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <FormLabel>Last Name:</FormLabel>
                <TextField
                  size="small"
                  {...register("last_name", { maxLength: 20, minLength: 2 })}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Birth Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  fullWidth
                  {...register("birth_date", {
                    validate: (value) => {
                      const birth_date = new Date(value);
                      const today = new Date();
                      const age = today.getFullYear() - birth_date.getFullYear();
                      return age >= 18 || "You must be 18 years old";
                    },
                  })}
                  error={!!errors.birth_date}
                  helperText={errors.birth_date?.message}
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <FormLabel>ID Card End Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  fullWidth
                  {...register("id_card_end_date", {
                    validate: (value) => {
                      const id_card_end_date = new Date(value);
                      const today = new Date();
                      return id_card_end_date > today || "ID card end date must be in the future";
                    },
                  })}
                  error={!!errors.id_card_end_date}
                  helperText={errors.id_card_end_date?.message}
                />
              </FormControl>
            </Box>

            <FormControl fullWidth margin="normal">
              <FormLabel>Contract Type:</FormLabel>
              <Select
                fullWidth
                size="small"
                variant="outlined"
                displayEmpty
                {...register("contract_type")}
                error={!!errors.contract_type}
                
              >
                <MenuItem disabled>
                  Previous Contract: {employee?.contract_type}
                </MenuItem>
                <MenuItem value="Temporary">Temporary</MenuItem>
                <MenuItem value="Permanent">Permanent</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Contract Validity Start Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  fullWidth
                  {...register("contract_validity_start_date", {
                    required: "Contract validity start date is required"
                  })}
                  error={!!errors.contract_validity_start_date}
                  helperText={errors.contract_validity_start_date?.message}
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <FormLabel>Contract Validity End Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  fullWidth
                  {...register("contract_validity_end_date", {
                    validate: (value) => {
                      const endDate = new Date(value);
                      const startDate = new Date(contractStartDate);
                      return endDate > startDate || "End date must be greater than the start date";
                    },
                  })}
                  error={!!errors.contract_validity_end_date}
                  helperText={errors.contract_validity_end_date?.message}

                />
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Visa Start Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  fullWidth
                  {...register("visa_start_date")}
                  error={!!errors.visa_start_date}
                  helperText={errors.visa_start_date?.message}
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <FormLabel>Visa End Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  fullWidth
                  {...register("visa_end_date", {
                    validate: (value) => {
                      if (!visaStartDate) return true;
                      if (!value) return "Visa End Date is required when Visa Start Date is set"; // Requerido si hay startDate 
                      const startDate = new Date(visaStartDate); 
                      const endDate = new Date(value);
                      return endDate > startDate || "End date must be greater than the start date";
                    },
                  })}
                  error={!!errors.visa_end_date}
                  helperText={errors.visa_end_date?.message}
                />
              </FormControl>

            </Box>

            <FormControl fullWidth margin="normal">
              <FormLabel>Email:</FormLabel>
              <TextField
                size="small"
                type="email"
                fullWidth
                {...register("user_credentials.email", {
                  pattern: {
                    value: /^[a-zA-Z0-9_.+-]+@micla\.info$/,
                    message: "Invalid email",
                  },
                })}
                error={!!errors.user_credentials?.email}
                helperText={errors.user_credentials?.email?.message}

              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel>User Name:</FormLabel>
              <TextField
                size="small"
                {...register("user_credentials.user_name",
                )}
                error={!!errors.user_credentials?.user_name}
                helperText={errors.user_credentials?.user_name?.message}
                fullWidth
              />
            </FormControl>

            <Typography variant="h4" gutterBottom textAlign={"center"}>
              Files
            </Typography>
            <Divider/>

              <FileUploadField
                name="profile_image"
                label="User Image"
                control={control}
                accept="image/png"
                setValue={setValue}
                watch={watch}
                isEdit={true}
                fiscalCode={employee?.fiscal_code} 
              />

               <FileUploadField
                name="id_card"
                label="ID Card"
                control={control}
                accept="image/png"
                setValue={setValue}
                watch={watch}
                isEdit={true}
                fiscalCode={employee?.fiscal_code} 
              />

               
              <FileUploadField
                name="visa"
                label="Visa"
                control={control}
                accept="application/pdf"
                setValue={setValue}
                watch={watch}
                isEdit={true}
                fiscalCode={employee?.fiscal_code} 
                errors={errors}
                rules={{
                  validate: (value:File) => {
                    const visaStartDate = watch("visa_start_date");
                    const visaEndDate = watch("visa_end_date");
                    if ((visaStartDate || visaEndDate) && !value && !hasPreviousVisa) {
                      return "Visa is required when visa dates are provided.";
                    }
                    return true;
                  },
                }}
              />
            
            <FileUploadField
                name="unilav"
                label="Unilav"
                control={control}
                accept="application/pdf"
                setValue={setValue}
                watch={watch}
                isEdit={true}
                fiscalCode={employee?.fiscal_code}
              /> 
               </DialogContent>

               <DialogActions sx={{ justifyContent: 'center' }}>
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 2,
    }}
  >
    {!setLoading && !isUpdated && (
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ marginTop: 2, marginBottom: 2 }}
        disabled={isButtonDisabled}
      >
        Update
      </Button>
    )}
    {setLoading && <CircularProgress />}
    <Button onClick={handleClose} color="primary" variant="contained">
      Cancel
    </Button>
  </Box>
</DialogActions>
          </form>
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
      </Container>
      </Dialog>
    ) : (
      <Loading message="Loading your data, please wait..." />
    )
  ) : (
    <Loading message="Loading your data, please wait..." />
  );
};

export default EditInformation;
