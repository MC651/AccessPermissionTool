import React, { useRef } from "react";
import { Controller,FieldErrors} from "react-hook-form";
import { Box, Button, TextField, IconButton } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ClearIcon from "@mui/icons-material/Clear";
import { FileUploadFieldProps } from "../types";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Employee } from "../types";

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  isEdit=false,
  name,
  label,
  accept,
  control,
  setValue,
  watch,
  rules = {},
  fiscalCode,
  errors = {} as FieldErrors<Employee>
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Box sx={{ display: "flex", alignItems: "center", marginTop: 2, gap: 2 }}>
      {isEdit && (
       <a
       href={`${import.meta.env.VITE_API_URL}/download/${fiscalCode}/${name}`}
       download 
       >
       <Button
         endIcon={<FileDownloadIcon />}
         variant="contained"
         size="small"
         sx={{ flex: 1 }}
       >
         Download
       </Button>
     </a>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={() => (
          <>
            <input
              ref={fileInputRef} // Ref para resetear el input
              accept={accept}
              style={{ display: "none" }}
              id={`${name}-upload`}
              type="file"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                setValue(name, file); // Asigna el archivo al formulario
              }}
            />
            <label htmlFor={`${name}-upload`} style={{ flex: 1 }}>
              <Button
                variant="contained"
                component="span"
                sx={{ height: "100%" }}
                fullWidth
                startIcon={<CloudUploadIcon />}
                size="small"
              >
                {label}
              </Button>
            </label>
            <TextField
              size="small"
              sx={{ flex: 3 }}
              variant="outlined"
              value={(watch(name) as { name?: string })?.name || ""}
              placeholder=" No file selected "
              disabled
              error={!!errors[name]}
              helperText={errors[name]?.message}

            />
            {watch(name) && (
              <IconButton
                onClick={() => {
                  setValue(name, null); // Elimina el archivo del formulario
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Limpia el valor del input
                  }
                }}
                color="error"
                sx={{ flexShrink: 0 }}
              >
                <ClearIcon />
              </IconButton>
            )}
          </>
        )}
      />
    </Box>
  );
}; 

export default FileUploadField;
