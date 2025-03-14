import { GridColDef } from "@mui/x-data-grid";
import { getStatusColor } from "../types";
import { Chip } from "@mui/material";

export const Columns: GridColDef[] = [
    { field: 'po_number', headerName: 'PO Number', width: 100 },
    { field: 'protocol_number', headerName: 'Protocol Number', width: 100,
      valueGetter: (_value,row) => {
        return `${row.protocol_number}`
    }},
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'issue_date',type:'date',headerName: 'Issue Date', width: 100,
      valueFormatter : (params) => {
        const value = params;
        return new Date(value).toISOString().split("T")[0];
    }},
    {field: 'status', headerName: 'Status', width: 100
      ,renderCell: (params) => {
        const status = params.row.status;
        const color_selctor = getStatusColor(status);
        return <Chip label={status} color={color_selctor} />;
       
      }
    },
    {
      field: 'validity_end_date',headerName: 'Validity End Date', width: 100,
      valueGetter: (_value,row) => {
        const new_date = row.validity_end_date;
        return `${new Date(new_date).toISOString().split("T")[0]}`
    }},
    { field: 'plant', headerName: 'Plant', width: 100,
      valueGetter: (_value,row) => {
        return `${row.plant}`
    }},
    {
      field: 'gates',headerName: 'Gates', width: 100,
      valueGetter: (_value,row) => {
        return `${row.gates}`
    }}
  ];