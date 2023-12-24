import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase-client';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((error as any).error_description || error.message);
    }
    setLoading(false);
  };

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">Supabase + React</h1>
        <p className="description">
          Sign in with your email and password below
        </p>
        <form className="form-widget" onSubmit={handleSignIn}>
          <div>
            <input
              className="inputField"
              type="email"
              name="email"
              placeholder="Your email"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              className="inputField"
              type="password"
              name="password"
              placeholder="Your password"
              value={password}
              required={true}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button className={'button block'} disabled={loading}>
              {loading ? <span>Loading</span> : <span>Sign in</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
