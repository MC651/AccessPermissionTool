import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";
import { Employee, RegisterProps } from "../types";
import { Box, Button, FormControl, FormLabel, TextField, MenuItem, Select, Typography, Container, Paper, Divider, CircularProgress } from "@mui/material";
import { useSnackbar } from "../hooks/useSnackbar";
import MessageBar from "../components/MessageBar";
import FileUploadField from "../register/FileInput"

const Register: React.FC<RegisterProps> = ({ elevation_level, isRegister, marginTop,marginRight,maxWidth,marginLeft }) => {
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [loading, isLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, reset, control, setValue } = useForm<Employee>();
  const { openSnackbar, snackBarMessage, snackbarSeverity, showSnackbar, handleCloseSnackbar } = useSnackbar();

  const contractStartDate = watch("contract_validity_start_date");
  const visaStartDate = watch("visa_start_date");

  const onSubmit = handleSubmit(async (data: Employee) => {
    console.log(data);
    isLoading(true);
    //console.log(data);
    const transformData = {
      ...data,
      purchase_order: []
    };
    console.log(transformData);
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("fiscal_code", data.fiscal_code);
    formData.append("birth_date", data.birth_date);
    formData.append("id_card_end_date", data.id_card_end_date);
    formData.append("contract_type", data.contract_type);
    formData.append("contract_validity_start_date", data.contract_validity_start_date);
    formData.append("contract_validity_end_date", data.contract_validity_end_date);
    formData.append("visa_start_date", data.visa_start_date);
    formData.append("visa_end_date", data.visa_end_date);
    formData.append("password", data?.user_credentials?.password);
    formData.append("email", data.user_credentials.email);
    formData.append("user_name", data.user_credentials.user_name);
    formData.append("profile_image", data.profile_image);
    formData.append("id_card", data.id_card);
    formData.append("visa", data.visa);
    formData.append("unilav", data.unilav);

    console.log(formData)

    try {
      const response = await axios.post("http://localhost:8000/create/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      showSnackbar(response.data.message, "success", true);
      //console.log(response);
      setIsUserCreated(true);
      isLoading(false);
      //reset();
    } catch (error) {
      showSnackbar(error?.response?.data?.detail, "error", true);
      isLoading(false);
      console.error("Error:", error);
    }
    finally {
      setTimeout(() => {
        setIsUserCreated(false);
        showSnackbar("", "warning", false);
      }, 2000);
    }
  });

  return (
    <Container maxWidth={maxWidth} sx={{marginRight:marginRight}}>
      <Paper sx={{ marginTop: marginTop, padding: 6, marginBottom: 8,marginLeft:marginLeft }} elevation={elevation_level}>
        <Box sx={{ maxWidth: 800, marginTop: 3, marginBottom: 3 }}>
          <Typography variant="h4" gutterBottom textAlign={"center"}>
            {isRegister ? "Register" : "Add New User"}
          </Typography>
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <form onSubmit={onSubmit}>
            {/* First Name */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth margin="normal">
                <FormLabel>First Name:</FormLabel>
                <TextField
                  size="small"
                  {...register("first_name", {
                    required: "First name is required",
                    maxLength: 20,
                    minLength: 2,
                  })}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>

              {/* Last Name */}
              <FormControl fullWidth margin="normal">
                <FormLabel>Last Name:</FormLabel>
                <TextField
                  size="small"
                  {...register("last_name", {
                    required: "Last name is required",
                    maxLength: 20,
                    minLength: 2,
                  })}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>
            </Box>
            {/* User Name */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth margin="normal">
                <FormLabel>User Name:</FormLabel>
                <TextField
                  size="small"
                  {...register("user_credentials.user_name", {
                    required: "User name is required",
                  })}
                  error={!!errors.user_credentials?.user_name}
                  helperText={errors.user_credentials?.user_name?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>
              {/* Fiscal Code */}
              <FormControl fullWidth margin="normal">
                <FormLabel>Fiscal Code:</FormLabel>
                <TextField
                  size="small"
                  {...register("fiscal_code", {
                    required: "Fiscal code is required",
                    pattern: {
                      value: /^[A-Z]{6}[0-9]{2}[A-Z]{1}[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{1}$/,
                      message: "Fiscal code format incorrect",
                    },
                  })}
                  error={!!errors.fiscal_code}
                  helperText={errors.fiscal_code?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Birth Date */}
              <FormControl fullWidth margin="normal">
                <FormLabel>Birth Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  {...register("birth_date", {
                    required: "Birth date is required",
                    validate: (value) => {
                      const birth_date = new Date(value);
                      const today = new Date();
                      const age = today.getFullYear() - birth_date.getFullYear();
                      return age >= 18 || "You must be 18 years old";
                    },
                  })}
                  error={!!errors.birth_date}
                  helperText={errors.birth_date?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>

              {/* ID Card End Date */}
              <FormControl fullWidth margin="normal">
                <FormLabel>ID Card End Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  {...register("id_card_end_date", {
                    required: "ID card end date is required",
                    validate: (value) => {
                      const id_card_end_date = new Date(value);
                      const today = new Date();
                      return id_card_end_date > today || "ID card end date must be in the future";
                    },
                  })}
                  error={!!errors.id_card_end_date}
                  helperText={errors.id_card_end_date?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>

            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Contract Validity Start Date */}
              <FormControl fullWidth margin="normal">
                <FormLabel>Contract Validity Start Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  {...register("contract_validity_start_date", {
                    required: "Contract validity start date is required",
                    validate: (value) => {
                      const startDate = new Date(value);
                      const today = new Date();
                      return startDate > today || "Contract validity start date must be greater than today";
                    },
                  })}
                  error={!!errors.contract_validity_start_date}
                  helperText={errors.contract_validity_start_date?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>

              {/* Contract Validity End Date */}
              <FormControl fullWidth margin="normal">
                <FormLabel>Contract Validity End Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  {...register("contract_validity_end_date", {
                    required: "Contract validity end date is required",
                    validate: (value) => {
                      const startDate = new Date(contractStartDate);
                      const endDate = new Date(value);
                      return endDate > startDate || "End date must be greater than the start date";
                    },
                  })}
                  error={!!errors.contract_validity_end_date}
                  helperText={errors.contract_validity_end_date?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>
            </Box>

            {/* Contract Type */}
            <FormControl fullWidth margin="normal">
              <FormLabel>Contract Type:</FormLabel>
              <Select
                size="small"
                {...register("contract_type", { required: "Contract type is required" })}
                error={!!errors.contract_type}
                displayEmpty
                fullWidth
                variant="outlined"
              >
                <MenuItem disabled>
                  -- Select contract type --
                </MenuItem>
                <MenuItem value="Temporary">Temporary</MenuItem>
                <MenuItem value="Permanent">Permanent</MenuItem>
              </Select>
              {errors.contract_type && <Typography color="error">{errors.contract_type.message}</Typography>}
            </FormControl>



            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Visa Start Date */}
              <FormControl fullWidth margin="normal">
                <FormLabel>Visa Start Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  {...register("visa_start_date", {
                    required: "Visa start date is required",
                  })}
                  error={!!errors.visa_start_date}
                  helperText={errors.visa_start_date?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>

              {/* Visa End Date */}
              <FormControl fullWidth margin="normal">
                <FormLabel>Visa End Date:</FormLabel>
                <TextField
                  size="small"
                  type="date"
                  {...register("visa_end_date", {
                    required: "Visa end date is required",
                    validate: (value) => {
                      const startDate = new Date(visaStartDate);
                      const endDate = new Date(value);
                      return endDate > startDate || "End date must be greater than the start date";
                    },
                  })}
                  error={!!errors.visa_end_date}
                  helperText={errors.visa_end_date?.message}
                  fullWidth
                  variant="outlined"
                />
              </FormControl>
            </Box>
            <Typography variant="h6" gutterBottom textAlign={"center"}>Files</Typography>
  
            <FileUploadField 
            name="profile_image"
            label="User Image"
            control={control}
            rules={{ required: true }}
            accept="image/png"
            setValue={setValue}
            watch={watch}


            />

            <FileUploadField
              name="id_card"
              label="ID Card"
              control={control}
              rules={{ required: true }}
              accept="image/png"
              setValue={setValue}
              watch={watch}
              />

            <FileUploadField
              name="visa"
              label="Visa"
              control={control}
              rules={{ required: true }}
              accept="application/pdf"
              setValue={setValue}
              watch={watch}

              />

              <FileUploadField
                name="unilav"
                label="Unilav"
                control={control}
                rules={{ required: true }}
                accept="application/pdf"
                setValue={setValue}
                watch={watch}
                />


           

            {/* Email */}
            <FormControl fullWidth margin="normal">
              <FormLabel>Email:</FormLabel>
              <TextField
                size="small"
                type="email"
                {...register("user_credentials.email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9_.+-]+@micla\.info$/,
                    message: "Invalid email",
                  },
                })}
                error={!!errors.user_credentials?.email}
                helperText={errors.user_credentials?.email?.message}
                fullWidth
                variant="outlined"
              />
            </FormControl>

            {/* Password */}
            <FormControl fullWidth margin="normal">
              <FormLabel>Password:</FormLabel>
              <TextField
                size="small"
                type="password"
                {...register("user_credentials.password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters long" },
                })}
                error={!!errors.user_credentials?.password}
                helperText={errors.user_credentials?.password?.message}
                fullWidth
                variant="outlined"
              />
            </FormControl>
            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
              {!isUserCreated && (
                <Button type="submit" variant="contained" color="primary" sx={{ display: 'inline', marginTop: 2, marginBottom: 2 }} >
                  Register
                </Button>
              )}
              {loading && (
                <CircularProgress />
              )}
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
          {isRegister && (
            <Box mt={2}>
              <Typography sx={{ marginTop: 2, marginBottom: 2, textAlign: "center" }}>
                <Link to="/login">Already have an account?</Link>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;

