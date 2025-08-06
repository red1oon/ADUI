import { useState, useEffect } from 'react';
import { useDataProvider } from '../context/DataContext';
import { ADWindowDefinition, ADReferenceValue } from '../../types/ADTypes';

  export const useWindowData = (windowId: string | null) => {
  const { provider } = useDataProvider();
  const [windowDef, setWindowDef] = useState<ADWindowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWindow = async () => {
      if (!windowId) {
        setLoading(false);    // ✅ Solution: explicitly set loading=false
        setWindowDef(null);   // ✅ and clear windowDef
        return;
      }
      setLoading(true);
      setError(null);
     
      try {
        const definition = await provider.getWindowDefinition(windowId);
        setWindowDef(definition);
      } catch (err: any) {
        setError(err.message);
        setWindowDef(null);
      } finally {
        setLoading(false);
      }
    };

    loadWindow();
  }, [windowId, provider]);

  return { windowDef, loading, error };
};

export const useReferenceData = (referenceId: string) => {
  const { provider } = useDataProvider();
  const [values, setValues] = useState<ADReferenceValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReference = async () => {
      if (!referenceId) return;
      
      setLoading(true);
      try {
        const refValues = await provider.getReferenceValues(referenceId);
        setValues(refValues);
      } catch (err: any) {
        console.warn(`Failed to load reference ${referenceId}:`, err);
        setValues([]);
      } finally {
        setLoading(false);
      }
    };

    loadReference();
  }, [referenceId, provider]);

  return { values, loading };
};

export const useFormData = (windowId: string, recordId?: string) => {
  const { provider } = useDataProvider();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFormData = async () => {
      if (!windowId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await provider.getFormData(windowId, recordId);
        setFormData(data);
      } catch (err: any) {
        setError(err.message);
        setFormData(null);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [windowId, recordId, provider]);

  const saveFormData = async (data: any) => {
    try {
      const result = await provider.saveFormData(windowId, data);
      if (result.success) {
        setFormData({ ...formData, ...data });
      }
      return result;
    } catch (err: any) {
      throw new Error(`Save failed: ${err.message}`);
    }
  };

  return { formData, loading, error, saveFormData };
};
