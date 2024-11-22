import { Box, LinearProgress, Typography } from "@mui/material";
import React from "react";

interface LargestContentfulPaint {
    message: string;
}

const Loading: React.FC<LargestContentfulPaint>= ({message}) => {
    return (
        <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Mensaje de carga */}
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        {message}
      </Typography>

      {/* Barra de progreso más grande */}
      <Box
        sx={{
          width: '80%',  // Ajusta el ancho de la barra de progreso
          maxWidth: 600, // Ajusta el máximo ancho
        }}
        >
        <LinearProgress
          sx={{
            height: 10, // Aumenta la altura de la barra
            borderRadius: 5, // Esquinas redondeadas
          }}
        />
      </Box>
    </Box>
    );
}

export default Loading;