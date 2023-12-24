import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect } from 'react';
import TodoList from '../components/todo-list';

let resettingPassword = false;

function App() {
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (_event, session) => {
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
  }, [supabase.auth]);

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? (
        <>
          {/* <Auth /> */}
          {/* <Login /> */}
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={[]}
          />
        </>
      ) : (
        // <Account key={session.user.id} session={session} />
        <TodoList session={session} />
      )}
    </div>
  );
}

export default App;
