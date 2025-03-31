import { Avatar, Stack } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

const fiscalCode = localStorage.getItem("fiscal_code");

export default function ToolBarImage() {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (fiscalCode) {
      const fetchImage = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/retrieve_files/${fiscalCode}/`,
            { responseType: "blob" } // Necesario para obtener la imagen en binario
          );
          const imageBlob = new Blob([response.data]);
          const imageObjectURL = URL.createObjectURL(imageBlob);
          setImageUrl(imageObjectURL); // Establecer la URL de la imagen
        } catch (error) {
          console.error("Error fetching the image:", error);
        }
      };
      fetchImage();
    }
  }, [fiscalCode]);

  return (
    <Stack direction="row" spacing={2}>
      <Avatar src={imageUrl} alt="Profile Image" />
    </Stack>
  );
}