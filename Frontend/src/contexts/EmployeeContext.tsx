import React, {createContext, useContext} from 'react';
import { UserInfo } from '../fetches/FetchEmployee';
import { Employee, EmployeeContextType } from '../types';

const EmployeeContext = createContext<EmployeeContextType>({
    loaded: false,
    employee: null
});

export const useEmployee = () => useContext(EmployeeContext);

export const EmployeeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [loaded, employee] = UserInfo<Employee>();
    const value = {
        loaded,
        employee
    };
    return (<EmployeeContext.Provider value={value}>
        {children}
        </EmployeeContext.Provider>
    );    
};