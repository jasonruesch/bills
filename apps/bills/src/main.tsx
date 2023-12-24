import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { supabase } from './lib/supabase-client';

import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </StrictMode>
);
