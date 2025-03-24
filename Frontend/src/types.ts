import { AlertColor } from '@mui/material/Alert';
import { SubmitHandler,FieldErrors } from 'react-hook-form';
import { UseFormSetValue, UseFormWatch, Control } from "react-hook-form";
import { Breakpoint } from '@mui/material';
/* import {z} from 'zod'; */
export interface LoginFormInputss {
    username: string;
    password: string;
}
export interface Employee {
    first_name: string;
    last_name: string;
    fiscal_code: string;
    birth_date: Date | string;
    id_card_end_date: Date | string;
    contract_type: string;
    contract_validity_start_date: Date | string; 
    contract_validity_end_date: Date | string;
    visa_start_date: Date | string;
    visa_end_date: Date | string;
    user_credentials: UserCredentials;
    purchase_order:PurchaseOrder[];
    profile_image:File | null;
    id_card:File | null; 
    visa:File | null;
    unilav:File | null;
    profile_image_path?:string;
    id_card_path?:string;
    visa_path?:string;
    unilav_path?:string;
}

export interface AccesPermission{
  protocol_number?:string;
  plant?:string;
  status?:string;
  validity_end_date:Date | string; 
  address?:string;
  gates?: number[];
}
export interface  PurchaseOrder {
  po_number?:string;
  description?: string;
  issue_date?:Date | string;
  validity_end_date?:Date | string;
  duvri?:boolean;
  requester?:Requester;
  locations?: string[];
  access_permission?:AccesPermission[];
  subapalto?:Subapalto;
}


export interface Requester{
    first_name?:string;
    last_name?:string;
    email?:string;
  }
  

  export interface Subapalto{
    subapalto_number?:string;
    subapalto_status?:string;
  }
  

  export interface SinglePurchaseOrder {
    po_number?:string;
    description?: string;
    issue_date?:Date | string;
    validity_end_date?:Date | string;
    duvri?:boolean;
    requester?:Requester;
    locations?: string[];
    access_permission?:AccesPermission;
    subapalto?:Subapalto;
  }
  
export interface PurchaseOrdersArray{
  purchase_orders?:PurchaseOrder[];
}

export interface UserCredentials {
    user_type: string;
    email: string;
    password: string;
    user_name: string;
}

export interface EmployeeContextType {
    loaded : boolean;
    employee: Employee | null;
}

export interface Token { 
    exp: number;
    us:string;
    ut:string;
    fs:string;
}

export interface AutorizedRoles {
    children: React.ReactNode;
    allowed_roles: string[];
}

export interface LoginFormInputs {
    username: string;
    password: string;
}

export interface DashboardWrapperProps {
    children: React.ReactNode; 
}

export interface AppProviderRouter {
  pathname: string;
  navigate: (path: string) => void;
  searchParams: URLSearchParams;
}

export interface FilteredEmployees {
  first_name:string
  last_name:string 
  fiscal_code:string 
  contract_validity_start_date:Date
  contract_validity_end_date:Date 
  purchase_order:PurchaseOrder[]
}

export interface AllFilteredEmployees {
  all_employees?:FilteredEmployees[]
}
  
export interface CreatePurchaseOrder {
  fiscal_codes?: string[]
  purchase_order?: SinglePurchaseOrder
}

export interface DialogComponentProps {
  open: boolean;
  handleCloseAddPurchaseOrder: () => void;
  fiscal_codes: string[];
}

export interface AccessPermisionDialogComponentProps {
  open: boolean;
  handleCloseAccessPermission: () => void;
  fiscal_codes_with_purchase_orders: Record < string, string[] >;
}

export const plantOptions = [
  { name: 'Plant A' },
  { name: 'Plant B' },
  { name: 'Plant C' },
  { name: 'Plant D' },
  { name: 'Plant E' }
];

export interface CreateAccesPermission {
    fiscal_code?:string;
    po_numbers?:string[];
    access_permission?:AccesPermission;
  }

export interface RegisterProps { 
    elevation_level?: number;
    maxWidth: Breakpoint | false;
    marginRight?:number;
    isRegister?: boolean;
    marginTop?: number;
    marginLeft?:number;
  }
  export interface Row {
    fiscal_code?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    contract_validity_start_date?: string | Date | undefined;
    contract_validity_end_date?: string | Date | undefined;
    po_number?: string | undefined;
    description?: string | undefined;
    issue_date: string | Date;
    purchase_order_validity_end_date: string | Date;
    duvri?: boolean | undefined;
    locations?: string[] | undefined;
    requester_first_name?: string | undefined;
    requester_last_name?: string | undefined;
    requester_email?: string | undefined;
    protocol_number?: string | undefined;
    plant?: string | undefined;
    status?: string | undefined;
    access_permission_validity_end_date: string | Date;
    address?: string | undefined;
    gates?: number[] | undefined;
    subapalto_number?: string | undefined;
    subapalto_status?: string | undefined;
    id?: number | undefined;
  }
  
export interface EditTableProps { 
  open: boolean;
  handleCloseEditTable: () => void;
  row: Row | null;
}

export  const getStatusColor = (status: string) => {
  switch (status) {
      case 'Active':
          return 'success'; 
      case 'Requested':
          return 'warning'; 
      case 'Rejected':
          return 'error';
      default:
          return 'default'; 
  }
};

export interface EditPurchaseOrderProps {
  open: boolean;
  handleCloseEditPurchaseOrder: () => void;
  row?: Row | null;
}

export interface RouteError {
  statusText?: string;
  message?: string;
}

export interface DialogComponentRef {
  resetForm: () => void;
}

export interface DeleteUserProps {
  open: boolean;
  handleCloseDeleteUser: () => void;
  row: Row | null;
}

export interface DeletePurchaseOrderProps {
  open: boolean;
  handleCloseDeletePurchaseOrder: () => void;
  row: Row | null;
}

export interface UseSnackbarResult {
  openSnackbar: boolean;
  snackBarMessage: string;
  snackbarSeverity: "success" | "error" | "warning" | "info";
  showSnackbar: (message: string, severity: "success" | "error" | "warning" | "info",open:boolean) => void;
  handleCloseSnackbar: () => void;
}

export interface MessageBarProps {
  openSnackbar: boolean;
  autoHideDuration: number;
  snackBarMessage: string;
  snackbarSeverity: AlertColor; // Cambiamos a AlertColor para aceptar solo valores permitidos
  handleCloseSnackbar: () => void;
  vertical?: 'top' | 'bottom';
  horizontal?: 'left' | 'center' | 'right';
}

export interface LoginFormProps {
  onSubmit: SubmitHandler<LoginFormInputs>;
  loading: boolean;
}

export interface FileUploadFieldProps {
  isEdit?: boolean;
  name: keyof Employee;
  label: string;
  accept: string;
  control: Control<Employee>;
  setValue: UseFormSetValue<Employee>;
  watch: UseFormWatch<Employee>;
  rules?: object; // Opcional: Validaciones como required
  fiscalCode?:string;
  fileExtension?:string;
  errors?:FieldErrors<Employee>;
}

export interface AdminColumnsProps {
  handleOpenDialogPO: (row: Row) => void;
  handleOpenDialogAP: (row: Row) => void;
  handleOpenDeleteUser: (row: Row) => void;
  handleOpenDeletePurchaseOrder: (row: Row) => void;
  //getStatusColor: (status: string) => string;
}
export interface FastAPIError {
  response?: {
    data?: {
      detail?: string;
    };
  };
};