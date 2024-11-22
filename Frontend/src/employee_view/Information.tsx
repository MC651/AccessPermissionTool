import React from "react";
import { useEmployee } from "../contexts/EmployeeContext";
import { Box, Typography, Container, Divider } from "@mui/material";
import PurchaseOrders from "./PurchaseOrder";
import Loading from "../components/Loading";

const Information: React.FC = () => {
  const { loaded, employee } = useEmployee();
  const hasPurchaseOrders = employee?.purchase_order && employee?.purchase_order.length > 0;

  return !loaded ? (
    employee ? (
      <Container maxWidth="lg">
      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom textAlign={"center"}>
          Employee Information
        </Typography>
        <Divider sx={{marginTop:2,marginBottom:2}}/>
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1">First Name: {employee.first_name}</Typography>
          <Typography variant="body1">Last Name: {employee.last_name}</Typography>
        </Box>

        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1">Fiscal Code: {employee.fiscal_code}</Typography>
          <Typography variant="body1">
            Birth Date: {new Date(employee.birth_date).toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1">
            ID Card End Date: {new Date(employee.id_card_end_date).toLocaleDateString()}
          </Typography>
          <Typography variant="body1">Contract Type: {employee.contract_type}</Typography>
        </Box>

        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1">
            Contract Start Date: {new Date(employee.contract_validity_start_date).toLocaleDateString()}
          </Typography>
          <Typography variant="body1">
            Contract End Date: {new Date(employee.contract_validity_end_date).toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1">
            Visa Start Date: {new Date(employee.visa_start_date).toLocaleDateString()}
          </Typography>
          <Typography variant="body1">
            Visa End Date: {new Date(employee.visa_end_date).toLocaleDateString()}
          </Typography>
        </Box>
        <Divider sx={{marginTop:2,marginBottom:2}}/>
        {hasPurchaseOrders ? (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h5" gutterBottom sx={{}}>
              Detail of the Access Permission's
            </Typography>
            <PurchaseOrders purchase_orders={employee.purchase_order}/>
          </Box>
        ) : (
          <Typography variant="body2">No purchase orders available.</Typography>
        )}
      </Box>
     
      </Container>
    ) : (
      <Loading message="Loading your data, please wait..." />
    )
  ) : (
    <Loading message="Loading your data, please wait..." />
  );
};

export default Information;
