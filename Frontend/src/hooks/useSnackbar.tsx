import { useState } from "react";
import {UseSnackbarResult} from "../types";

export const useSnackbar = (): UseSnackbarResult => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("warning");

    const showSnackbar = (message: string, severity: "success" | "error" | "warning" | "info",open: boolean) => {
        setSnackBarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(open);
        console.log(message);
        console.log(severity);
        console.log(open);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return {
        openSnackbar,
        snackBarMessage,
        snackbarSeverity,
        showSnackbar,
        handleCloseSnackbar,
    };
};
