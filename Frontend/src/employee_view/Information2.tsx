import React from "react";
import { useState } from "react";
import { useEmployee } from "../contexts/EmployeeContext";
import { Box, Typography, Container, Divider, Paper, Button } from "@mui/material";
import PurchaseOrders from "./PurchaseOrder";
import Loading from "../components/Loading";
import ToolBarImage from "../wrapper/ToolBarImage";
import EditInformation from "./EditInformation";

const Information2: React.FC = () => {
  const { loaded, employee } = useEmployee();
  const [openEditUser, setOpenEditUser] = useState(false);

  const handleOpenEditTable = () => {
    setOpenEditUser(true);
  };

  const handleCloseEditTable = () => {
    setOpenEditUser(false);
  };

  return !loaded ? (
    employee ? (
        <Container maxWidth="lg" sx={{ mx: 'auto', px: 2,marginTop:5 }}>
        <Box sx={{ display: 'flex', gap: '50px', marginBottom: 10 }}>
        <Paper sx={{ width: 350, flexShrink: 0, padding: 5, marginTop: 2, marginBottom: 8 }}elevation={10}>

                <ToolBarImage/>
                <Typography sx={{marginTop:3}}variant="body1">{employee.first_name} {employee.last_name}</Typography>
                <Typography sx={{marginTop:1}}variant="body1">{employee.user_credentials.email}</Typography>
                <Typography sx={{marginTop:1}}variant="body1">{employee.user_credentials.user_name}</Typography>
                <Divider sx={{marginTop:3,marginBottom:3}}/>
                <Typography sx={{marginTop:3}}variant="body1">Fiscal Code: {employee.fiscal_code}</Typography>
                <Typography sx={{marginTop:2}}variant="body1">Birth Date: {new Date(employee.birth_date).toLocaleDateString()}</Typography>
                <Typography sx={{marginTop:2}}variant="body1">Id validity until: {new Date(employee.id_card_end_date).toLocaleDateString()}</Typography>
                <Typography sx={{marginTop:2}}variant="body1">Contract Type: {employee.contract_type}</Typography>
                <Typography sx={{marginTop:2}}variant="body1">Contract Validity until: {new Date(employee.contract_validity_end_date).toLocaleDateString()}</Typography>
                {employee.visa_start_date ? (
                <Typography sx={{ marginTop: 1 }} variant="body1">
                    Visa Validity until: {new Date(employee.visa_end_date).toLocaleDateString()}
                </Typography>
                ) : (
                <Typography sx={{ marginTop: 1 }} variant="body1">
                    Visa not required
                </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3, marginBottom: 3 }}>
                <Button variant="contained" 
                color="primary"
                onClick={handleOpenEditTable}
                >
                    Edit Information
                </Button>
                </Box>
            </Paper>
            <Paper sx={{ width: 850, flexShrink: 0,padding: 5, marginTop: 2, marginBottom: 8 }}elevation={10}>
            <Typography variant="h3" gutterBottom sx={{textAlign :'center'}}>
              Purchase Orders
            </Typography>
            <PurchaseOrders purchase_orders={employee.purchase_order}/>
            </Paper>

            <EditInformation open={openEditUser} handleCloseEditTable={handleCloseEditTable}/>

        </Box>
      
      </Container>
    ) : (
      <Loading message="Loading your data, please wait..." />
    )
  ) : (
    <Loading message="Loading your data, please wait..." />
  );
};

export default Information2;