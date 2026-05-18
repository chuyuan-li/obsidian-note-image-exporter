import React, { createContext, useContext, useState } from 'react';

type FormValues = Record<string, unknown>;

interface FormContextType {
  values: FormValues;
  setFieldValue: (field: string, value: unknown) => void;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const FormContext = createContext<FormContextType>({} as FormContextType);

export const FormProvider: React.FC<{
  initialValues: FormValues;
  children: React.ReactNode;
}> = ({ initialValues, children }) => {
  const [values, setValues] = useState<FormValues>(initialValues);

  const setFieldValue = (field: string, value: unknown) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <FormContext.Provider value={{ values, setFieldValue, setValues }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext); 
