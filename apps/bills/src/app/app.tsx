import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase-client';
import Account from './account';
import Login from './login';

let resettingPassword = false;

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (!resettingPassword && _event === 'PASSWORD_RECOVERY') {
        resettingPassword = true;

        const newPassword =
          prompt('What would you like your new password to be?') ?? undefined;
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          alert('There was an error updating your password.');
        } else {
          alert('Password updated successfully!');
        }

        resettingPassword = false;
      }
    });
  }, []);

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? (
        <>
          {/* <Auth /> */}
          <Login />
        </>
      ) : (
        <Account key={session.user.id} session={session} />
      )}
    </div>
  );
}

export default App;
