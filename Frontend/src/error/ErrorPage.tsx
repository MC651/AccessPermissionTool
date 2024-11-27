import { Link, useRouteError } from "react-router-dom";
import {RouteError} from "../types"
import { Box, Container, Typography } from "@mui/material";


const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouteError;
  console.error(error);
  return (
    <div id="error-page">
      <Container maxWidth="md" sx={{mt:15}}>
        <Box textAlign={"center"}> 
      <Typography variant="h1">
        Oooooops! Page Not Found
      </Typography>
      <Typography variant="h6" gutterBottom sx={{mt:3,mb:2}}>
        Sorry!, an unexpected error has occurred or the page was not found
      </Typography>
      <Typography variant="h6" gutterBottom sx={{mt:2}}>
      <Link to="/home">Go back to home page</Link>
      </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default ErrorPage;
