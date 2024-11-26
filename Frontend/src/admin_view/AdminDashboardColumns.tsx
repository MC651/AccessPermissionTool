import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { AdminColumnsProps,getStatusColor } from "../types";
import { Chip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileCopyIcon from '@mui/icons-material/FileCopy';

  export const createColumns = ({
    handleOpenDialogPO,
    handleOpenDialogAP,
    handleOpenDeleteUser,
    handleOpenDeletePurchaseOrder,
  }: AdminColumnsProps): GridColDef[] => [
    { field: 'id', headerName: 'ID', width: 100 },
    {
      field: 'first_name', headerName: 'Employee', width: 100,
      valueGetter: (value, row) => {
        return `${row.first_name} ${row.last_name}`
      }
    },
    {
      field: 'fiscal_code',
      headerName: 'Fiscal Code',
      width: 100,
      editable: true,
    },
    {
      field: 'po_number',
      headerName: 'PO Number',
      width: 150,
      editable: true
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
      editable: true
    },
    {
      field: 'issue_date',
      type: 'date',
      headerName: 'Issue Date',
      width: 150,
      editable: true,
      valueFormatter: (params) => {
        const value = params;
        return new Date(value).toISOString().split("T")[0];
      }
    },
    {
      field: 'purchase_order_validity_end_date',
      headerName: 'PO Validity End Date',
      width: 100,
      editable: true,
      valueGetter: (value, row) => {
        const new_date = row.purchase_order_validity_end_date;
        return `${new Date(new_date).toISOString().split("T")[0]}`
      }
    },
    {
      field: 'duvri', headerName: 'Duvri', width: 100,
      valueFormatter: (params) => {
        const value = params;
        return value === false ? "Not Required" : "Required";

      }
    },
    {
      field: 'requester',
      headerName: 'Requester',
      width: 150,
      editable: true,
      valueGetter: (value, row) => {
        return `${row.requester_first_name} ${row.requester_last_name}`
      }
    },
    {
      field: 'locations',
      headerName: 'Locations',
      width: 100,
      valueGetter: (value, row) => {
        return `${row.locations}`
      }
    },
    {
      field: 'subapalto_number',
      headerName: 'Subapalto Number',
      width: 150,
      valueGetter: (value, row) => {
        return `${row.subapalto_number}`
      }
    },
    {
      field: 'subapalto_status',
      headerName: 'Subapalto Status',
      width: 100,
      renderCell: (params) => {
        const status = params.row.subapalto_status;
        const color_selctor = getStatusColor(status);
        return <Chip label={status} color={color_selctor} />;

      }
    },
    {
      field: 'protocol_number',
      headerName: 'Protocol Number',
      width: 150,
      editable: true,
      valueGetter: (value, row) => {
        return `${row.protocol_number}`
      }
    },
    {
      field: 'Plant',
      headerName: 'Plant',
      width: 150,
      editable: true,
      valueGetter: (value, row) => {
        
        return `${row.plant}`
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      editable: true,
      renderCell: (params) => {
        const status = params.row.status;
        const color_selctor = getStatusColor(status);
        return <Chip label={status} color={color_selctor} />;

      }
    },
    {
      field: "access_permission_validity_end_date",
      headerName: "Access Permission Validity End Date",
      width: 100,
      editable: true,
      valueGetter: (value, row) => {
        const new_date = row.access_permission_validity_end_date;
        return `${new Date(new_date).toISOString().split("T")[0]}`
      }
    },
    {
      field: 'address',
      headerName: 'Address',
      width: 100,
      editable: true,
      valueGetter: (value, row) => {
        return `${row.address}`
      }
    },
    {
      field: 'gates',
      headerName: 'Gates',
      width: 100,
      editable: true,
      valueGetter: (value, row) => {
        return `${row.gates}`
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit Access Permission"
          onClick={() => handleOpenDialogPO(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
        icon={<FileCopyIcon />}
        label="Edit Purchase Order"
        onClick={() => handleOpenDialogAP(params.row)}
        showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label='Delete User'
          onClick={() => handleOpenDeleteUser(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete Purchase Order"
          onClick={() => handleOpenDeletePurchaseOrder(params.row)}
          showInMenu
        />
      ],
    },
  ];