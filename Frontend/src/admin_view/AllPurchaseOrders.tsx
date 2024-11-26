import { useState} from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { AllFilteredEmployees,Row } from '../types.ts';
import { Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddPurchaseOrder from './AddPurchaseOrder.tsx';
import AddAccessPermission from './AddAccessPermission.tsx';
import EditAccessPermission from './EditAccessPermission.tsx';
import EditPurchaseOrder from './EditPurchaseOrder.tsx';
import DeleteUser from './DeleteUser.tsx';
import DeletePurchaseOrder from './DeletePurchaseOrder.tsx'; 
import { createColumns } from './AdminDashboardColumns.tsx';




const PurchaseOrders: React.FC<AllFilteredEmployees> = ({ all_employees }: AllFilteredEmployees) => {

  const fiscal_codes: string[] = all_employees?.map(employee => employee.fiscal_code) || [];

  const fiscal_codes_with_purchase_orders = all_employees?.reduce((acc, employee) => {
    const poNumbers = Array.isArray(employee.purchase_order) 
      ? employee.purchase_order.map(order => order.po_number || '') 
      : [];
  
    acc[employee.fiscal_code] = poNumbers;
    return acc;
  }, {} as Record<string, string[]>) || {};
  
const flatEmployees = all_employees?.flatMap(employee =>
  employee?.purchase_order?.flatMap(order =>
    ((order?.access_permission?.length || 0) > 0
      ? order.access_permission
      : [{}] 
    )?.map(permission => ({
      fiscal_code: employee.fiscal_code || "",
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      contract_validity_start_date: employee.contract_validity_start_date || "",
      contract_validity_end_date: employee.contract_validity_end_date || "",
      po_number: order.po_number || "",
      description: order.description || "",
      issue_date: order.issue_date || "",
      purchase_order_validity_end_date: order.validity_end_date || new Date().toISOString().split("T")[0],
      duvri: order.duvri || "",
      locations: order.locations || "",
      requester_first_name: order.requester?.first_name || "",
      requester_last_name: order.requester?.last_name || "",
      requester_email: order.requester?.email || "",
      protocol_number: permission.protocol_number || "",
      plant: permission.plant || "",
      status: permission.status || "",
      access_permission_validity_end_date: permission.validity_end_date || new Date("1970-01-01"),
      address: permission.address || "",
      gates: permission.gates || "",
      subapalto_number: order.subapalto?.subapalto_number || "",
      subapalto_status: order.subapalto?.subapalto_status || ""
    }))
  ) || []
)?.map((item, index) => ({ ...item, id: index })) || [];

console.log(flatEmployees);

  const [openPurchaseOrder, setOpenPurchaseOrder] = useState(false);
  const [openAccessPermission, setOpenAccessPermission] = useState(false);
  const [openEditAccessPermission, setOpenEditAccessPermission] = useState(false);
  const [openEditPurchaseOrder, setOpenEditPurchaseOrder] = useState(false);
  const [openDeleteUser, setOpenDeleteUser] = useState(false);
  const [openDeletePurchaseOrder, setOpenDeletePurchaseOrder] = useState(false);
  const [row, setRow] = useState<Row | null>();
  


  const handleAddPurchaseOrderClick = () => {
    setOpenPurchaseOrder(true);
  };

const handleAddAccessPermissionClick = () => {
    setOpenAccessPermission(true);
};

const handleCloseAddPurchaseOrder = () => {
  setOpenPurchaseOrder(false);
}

const handleCloseAccessPermission = () => {
    setOpenAccessPermission(false);
};

const handleOpenDialogPO = (row: Row) => {
  setOpenEditAccessPermission(true);
  setRow(row);
};

const handleOpenDialogAP = (row: Row) => {
  setOpenEditPurchaseOrder(true);
  setRow(row);
};

const handleOpenDeleteUser = (row : Row) => {
  setOpenDeleteUser(true);
  setRow(row);
}

const handleOpenDeletePurchaseOrder = (row : Row) => {
  setOpenDeletePurchaseOrder(true);
  setRow(row);
}

const handleCloseEditAccessPermission = () => {
  setOpenEditAccessPermission(false);
  setRow(null);
}

const handleCloseEditPurchaseOrder = () => {
  setOpenEditPurchaseOrder(false);
  setRow(null);
}




const handleCloseDeleteUser = () => {
  setOpenDeleteUser(false);
}


const handleCloseDeletePurchaseOrder = () => {
  setOpenDeletePurchaseOrder(false);
}

  const columns = createColumns({
    handleOpenDialogPO,
    handleOpenDialogAP,
    handleOpenDeleteUser,
    handleOpenDeletePurchaseOrder,
  });

  return (
    <div style={{ height: 500, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap:67 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddPurchaseOrderClick}
        style={{ marginBottom: 16 }}
      >
        Add New Purchase Order
      </Button>
      <Button
      variant='contained'
      color='primary'
      startIcon={<AddIcon />}
      onClick={handleAddAccessPermissionClick}
      style={{ marginBottom: 16 }}
      >
        Add New Access Permission
      </Button>
      </Box>

      <DataGrid
        rows={flatEmployees} // Usa el array plano de empleados y órdenes de compra
        columns={columns}
        getRowId={(row) => row.id} // ID único para cada fila
        slots={{
          toolbar: GridToolbar,

        }}
      />

      <AddPurchaseOrder open={openPurchaseOrder} handleCloseAddPurchaseOrder={handleCloseAddPurchaseOrder} fiscal_codes={fiscal_codes}/>
      <AddAccessPermission open={openAccessPermission} handleCloseAccessPermission={handleCloseAccessPermission} fiscal_codes_with_purchase_orders={fiscal_codes_with_purchase_orders}/>
      <EditAccessPermission open={openEditAccessPermission} handleCloseEditTable={handleCloseEditAccessPermission} row={row as Row}/>
      <EditPurchaseOrder open={openEditPurchaseOrder} handleCloseEditPurchaseOrder={handleCloseEditPurchaseOrder} row={row as Row}/>
      <DeleteUser open={openDeleteUser} handleCloseDeleteUser={handleCloseDeleteUser} row={row as Row}/>
      <DeletePurchaseOrder open={openDeletePurchaseOrder} handleCloseDeletePurchaseOrder={handleCloseDeletePurchaseOrder} row={row as Row}/>
    </div>

  );
};

export default PurchaseOrders;





