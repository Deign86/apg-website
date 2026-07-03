import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ImageUploader({ bucket, value = [], onChange, max = 10 }) {
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(async (files) => {
    if (value.length + files.length > max) {
      alert(`Max ${max} images.`);
      return;
    }
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${bucket}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file);
      if (error) { console.error('Upload error:', error); continue; }
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      urls.push(publicUrl);
    }
    onChange([...value, ...urls]);
    setUploading(false);
  }, [bucket, value, onChange, max]);

  const remove = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {value.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid #2a2a2a' }}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => remove(i)}
              style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.7)', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              &times;
            </button>
          </div>
        ))}
      </div>
      {value.length < max && (
        <label className="admin-btn admin-btn-secondary admin-btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
          {uploading ? 'Uploading...' : <><i className="fa-solid fa-upload" /> Upload Images</>}
          <input type="file" multiple accept="image/*" hidden onChange={e => { if (e.target.files.length) upload([...e.target.files]); e.target.value = ''; }} disabled={uploading} />
        </label>
      )}
    </div>
  );
}
