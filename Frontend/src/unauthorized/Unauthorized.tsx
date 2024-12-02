import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

const Unauthorized = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Regresa a la ruta anterior
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "80vh",
                textAlign: "center",
                bgcolor: "background.default",
                p: 1,
            }}
        >
            <Typography variant="h1" color="error" gutterBottom>
                Unauthorized
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
                You do not have permission to access this page. 
                </Typography>
            <Button
                
                variant="outlined"
                color="primary"
                onClick={handleGoBack}
                sx={{ textTransform: "none",mt:3 }}
            >
                Return
            </Button>
        </Box>
    );
};

export default Unauthorized;
