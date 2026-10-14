import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/** Password input with a show/hide toggle inside its right edge. Props go to the <input>. */
export default function PasswordInput(props) {
  const [shown, setShown] = useState(false);
  return (
    <div className="admin-pw">
      <input {...props} type={shown ? 'text' : 'password'} />
      <button
        type="button"
        className="admin-pw-toggle"
        aria-label={shown ? 'Hide password' : 'Show password'}
        aria-pressed={shown}
        onClick={() => setShown((s) => !s)}
      >
        {shown ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}
