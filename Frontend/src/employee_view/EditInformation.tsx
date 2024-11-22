import React, { useState } from "react";
import { useEmployee } from "../contexts/EmployeeContext";
import { useForm } from "react-hook-form";
import { Employee } from "../types";
import axios from "axios";
import { TextField, Button, Box, Typography, MenuItem, Container, Divider, FormControl, FormLabel, CircularProgress, Select } from "@mui/material";
import Loading from "../components/Loading";
import { useSnackbar } from "../hooks/useSnackbar";
import MessageBar from "../components/MessageBar";
import FileUploadField from "../register/FileInput";

const EditInformation: React.FC = () => {
  const { loaded, employee } = useEmployee();
  //console.log(employee);
  delete employee?.files;
  //console.log(employee);
  
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
    }
  });

  //console.log(watch());
  console.log(watch("profile_image"));

  const {openSnackbar,snackBarMessage,snackbarSeverity,showSnackbar,handleCloseSnackbar} = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  
  const contractStartDate = watch("contract_validity_start_date");
  const visaStartDate = watch("visa_start_date");
  const idEndDate = watch("id_card_end_date");

  const onSubmit = handleSubmit(async (data: Employee) => {
    console.log(data);
  console.log(dirtyFields);
  setIsLoading(true);

  // Verifica si no hay campos modificados y si no se seleccionó una nueva imagen
  const hasDirtyFields = Object.keys(dirtyFields).length > 0;
  const hasNewProfileImage = !!data.profile_image; // Verifica si hay un archivo cargado

  if (!hasDirtyFields && !hasNewProfileImage) {
    showSnackbar("You haven't modified any field", "warning", true);
    setIsLoading(false);
    return;
  }

  // Si hay cambios, procesa los campos modificados y/o la nueva imagen
  const updatedFields = Object.keys(dirtyFields).reduce((acc, key) => {
    const field = key as keyof Employee;
    if (dirtyFields[field]) {
      acc[field] = data[field];
    }
    return acc;
  }, {} as Partial<Employee>);

  if (hasNewProfileImage) {
    updatedFields.profile_image = data.profile_image; // Incluye el archivo si se subió
  }

  console.log("Updated fields:", updatedFields);

  /*   try { 
      const response = await axios.patch(
        `http://localhost:8000/update/${employee?.fiscal_code}`,
        updatedFields,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      showSnackbar(response.data.message,"success",true);
      setIsLoading(false);
      setIsUpdated(true);
      //reset();
    } catch (error) {
      showSnackbar(error?.response?.data?.detail || "Error updating data","error",true);
      setIsLoading(false);
      console.log(error)
      //console.log(error)
    } finally {
      setTimeout(() => {
       
        showSnackbar("","warning",false);
        setIsLoading(false);
        setIsUpdated(false);
      }, 1500);
    } */
  });

  return !loaded ? (
    employee ? (
      <Container maxWidth="lg">

        <Box sx={{ maxWidth: 800, margin: "auto", marginTop: 3, marginBottom: 3 }}>
          <Typography variant="h4" gutterBottom textAlign={"center"}>
            Edit Information
          </Typography>
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <form onSubmit={onSubmit}>
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
                    validate: (value) => {
                      const startDate = new Date(value);
                      const visaStart = new Date(visaStartDate);
                      const idStart = new Date(idEndDate);
                      return (startDate > visaStart && startDate < idStart) || "Contract validity start date must be greater than Visa Start Date and Less than ID End Date";
                    },
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
                  {...register("visa_start_date", {
                    validate: (value) => {
                      const startDate = new Date(value);
                      const idEnd = new Date(idEndDate);
                      return startDate < idEnd || "Visa Start Date must be lower than ID End";
                    },
                  })}
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
                rules={{ required: true }}
                accept="image/png"
                setValue={setValue}
                watch={watch}
                isEdit={true}
                fiscalCode={employee?.fiscal_code} 
                fileExtension="png"
              />

              {/* <FileUploadField
                name="id_card"
                label="ID Card"
                control={control}
                rules={{ required: true }}
                accept="image/png"
                setValue={setValue}
                watch={watch}
                isEdit={true}
                fiscalCode={employee?.fiscal_code} 
                fileExtension="png"
              />

              <FileUploadField
                name="visa"
                label="Visa"
                control={control}
                rules={{ required: true }}
                accept="application/pdf"
                setValue={setValue}
                watch={watch}
                isEdit={true}
                fiscalCode={employee?.fiscal_code} 
                fileExtension="pdf"
              />
            
            <FileUploadField
                name="unilav"
                label="Unilav"
                control={control}
                rules={{ required: true }}
                accept="application/pdf"
                setValue={setValue}
                watch={watch}
                isEdit={true}
                fiscalCode={employee?.fiscal_code} 
                fileExtension="pdf"
              />  */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              {!isLoading && !isUpdated && (
                <Button type="submit" variant="contained" color="primary" sx={{ display: 'inline', marginTop: 2, marginBottom: 2 }} >
                  Update
                </Button>
              )}
              {isLoading && (
                <CircularProgress />
              )}
            </Box>
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
    ) : (
      <Loading message="Loading your data, please wait..." />
    )
  ) : (
    <Loading message="Loading your data, please wait..." />
  );
};

export default EditInformation;
