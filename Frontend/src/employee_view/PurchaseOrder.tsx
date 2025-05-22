import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import React from 'react';
import { PurchaseOrdersArray } from "../types";
import { Columns } from './PurchaseOrderColumns';

const PurchaseOrders: React.FC<PurchaseOrdersArray> = ({ purchase_orders }: PurchaseOrdersArray) => {

  const FlatPurchaseOrder = purchase_orders?.flatMap(order =>
    order.access_permission?.map(permission => ({
      po_number: order.po_number,
      description: order.description,
      issue_date: order.issue_date,
      status: permission.status,
      validity_end_date: permission.validity_end_date,
      protocol_number: permission.protocol_number,
      plant: permission.plant,
      gates: permission.gates,
    }))
  ).map((item, index) => ({ ...item, id: index }));


  return (
    <div style={{ height: 500, width: '100%',marginTop:10 }}>
      <DataGrid
        rows={FlatPurchaseOrder}
        columns={Columns}
        getRowId={() =>  Math.random()}
        slots={{
          toolbar: GridToolbar,
        }}
      />
    </div>
  );
};

export default PurchaseOrders;
