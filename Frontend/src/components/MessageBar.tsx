import { Snackbar, Alert } from "@mui/material";
import {MessageBarProps} from "../types"

const MessageBar: React.FC<MessageBarProps> = ({vertical = 'top',horizontal = 'center',autoHideDuration,openSnackbar,snackBarMessage,handleCloseSnackbar,snackbarSeverity}) => {

    return (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={autoHideDuration}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: vertical, horizontal: horizontal }}
          sx={{ zIndex: 1500 }} // Asegura que tenga un z-index alto
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackBarMessage}
          </Alert>
        </Snackbar>
    );
};

export default MessageBar;
