import { Container, Typography, Box, Divider } from "@mui/material";
import PurchaseOrders from "./AllPurchaseOrders";
import fetchAdminData from "./AdminData";

const AdminDashboard: React.FC = () => {
    const {loading,userInfo,error} = fetchAdminData();
    
    return (
        <Container maxWidth="lg" sx={{ marginBottom: 2 }}>
            {!loading && userInfo && (
                <Box sx={{ padding: 4 }}>
                    <Typography variant="h4" gutterBottom textAlign={"center"}>Administrator Dashboard</Typography>
                    <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
                    <PurchaseOrders all_employees={userInfo} />
                </Box>
            )}
        </Container>
    )
}

export default AdminDashboard;