import { Link, useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import {TextField,Button,Box,Typography,Container, Paper} from "@mui/material"; // Importar componentes de MUI
import { FastAPIError, LoginFormInputs } from "../types";
import { useSnackbar } from "../hooks/useSnackbar";
import MessageBar from "../components/MessageBar";

const Login: React.FC = () => {
  const {openSnackbar,snackBarMessage,snackbarSeverity,showSnackbar,handleCloseSnackbar} = useSnackbar();
  const {register,handleSubmit,formState: { errors },} = useForm<LoginFormInputs>();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    const formBody = {
      username: data.username,
      password: data.password,
    };
    try {
      const response = await axios.post(`http://localhost:8000/login`, 
        formBody, 
        {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
      localStorage.setItem("access_token", response.data["access_token"]);
      localStorage.setItem("user_type", response.data["ut"]);
      //localStorage.setItem("user_name", response.data["us"]);
      localStorage.setItem("fiscal_code", response.data["fs"]);
      showSnackbar(response.data.message || "Login Successful", "success",true);
      console.log(response);
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    }
    catch (error) {
      showSnackbar((error as FastAPIError)?.response?.data?.detail || "Error loggin in", "error",true);
      console.error("Error:", error);
    } finally {
      setTimeout(() => {
        showSnackbar("","warning",false);
      }, 2000); 
    } 
  };

  return (
    <Container maxWidth="xs">
      <Paper sx={{ marginTop: 10, padding: 4 }} elevation={15}>
        <Box sx={{ maxWidth: 400, margin: "auto", marginTop: 2, marginBottom: 2 }}>
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box mb={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Username"
                label="Username"
                {...register("username", {
                  required: {
                    value: true,
                    message: "Username is Required",
                  },
                })}
                error={!!errors.username}
                helperText={errors.username?.message}
              />
            </Box>
            <Box mb={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="••••••"
                type="password"
                label="Password"
                {...register("password", {
                  required: {
                    value: true,
                    message: "Password is Required",
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </form>
          <Typography sx={{ marginTop: 2, marginBottom: 2, textAlign: "center" }}>
            Don't have an account? <Link to={"/register"}>Register</Link>
          </Typography>
        </Box>
      </Paper>
      <MessageBar
        openSnackbar={openSnackbar}
        autoHideDuration={2000}  // Cierra el snackbar automáticamente después de 3 segundos
        snackBarMessage={snackBarMessage}
        snackbarSeverity={snackbarSeverity}
        handleCloseSnackbar={handleCloseSnackbar}  // Cierra el snackbar al hacer clic en la `Alert`
        vertical="top"
        horizontal="center"
      />
    </Container>
  );
};

export default Login;