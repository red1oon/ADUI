# ADUI Data Layer v1.0

## Clean separation between data fetching and UI rendering

### Quick Start

```typescript
// Wrap your app with data provider
import { DataContextProvider } from './data/context/DataContext';

export default function App() {
  return (
    <DataContextProvider>
      <YourAppComponents />
    </DataContextProvider>
  );
}

// Use in components
import { useWindowData, useReferenceData } from './data/hooks/useWindowData';

const MyForm = () => {
  const { windowDef, loading, error } = useWindowData('EQUIP_INSPECTION');
  const { values } = useReferenceData('CONDITION_LIST');
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  // Render form using windowDef...
};
```

### Architecture Benefits

1. **Clean Separation**: UI components don't know if data comes from mock or API
2. **Easy Evolution**: Switch from mock to real iDempiere API seamlessly  
3. **Type Safety**: Full TypeScript support for AD metadata
4. **Caching**: Built-in caching for performance
5. **Error Handling**: Centralized error management

### Configuration

```typescript
// Use mock data (default)
const mockConfig: DataConfig = { provider: 'mock' };

// Use real iDempiere API
const apiConfig: DataConfig = {
  provider: 'api',
  apiConfig: {
    baseUrl: 'https://your-idempiere.com',
    apiKey: 'your-api-key'
  }
};
```
