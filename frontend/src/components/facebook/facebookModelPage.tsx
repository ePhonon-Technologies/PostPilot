// FacebookPageModal.tsx

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';
import { useAppDispatch } from '../../store/hook';
import { fetchProviderConnections, fetchSocialAccounts } from '../../store/slices/socialAccountSlice';
import type {
  FacebookPage,
  FacebookPageModalProps,
} from '../../types/socialAccounts';
import apiRequest from '../../api/client';

export default function FacebookPageModal({
  open,
  onClose,
}: FacebookPageModalProps) {
  const dispatch = useAppDispatch();

  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchPages = async () => {
      setLoading(true);

      try {
        const res = await apiRequest.get<FacebookPage[]>('/facebook/pages', {
          withCredentials: true,
        });

        const data = res.data;
        console.log('data in the facebook page', data);
        setPages(data);

        setSelected(
          data.filter((page) => page.connected).map((page) => page.id),
        );
      } catch {
        toast.error('Failed to fetch Facebook Pages');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [open]);

  const togglePage = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((pageId) => pageId !== id)
        : [...prev, id],
    );
  };

const handleConnect = async () => {
  const pagesToConnect = pages.filter(
    (page) => selected.includes(page.id) && !page.connected,
  );

  if (pagesToConnect.length === 0) {
    onClose();
    return;
  }

  setSaving(true);

  try {
    await apiRequest.post('/facebook/pages/connect', {
      pages: pagesToConnect,
    });

    toast.success('Pages connected successfully');
    
    // Clear selection state and reload connected accounts
    setSelected([]);
  
    dispatch(fetchSocialAccounts());
dispatch(fetchProviderConnections());
    
    onClose();
  } catch (error) {
    console.error('Error connecting pages:', error);
    toast.error('Failed to connect pages');
  } finally {
    setSaving(false);
  }
};

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='w-full max-w-lg rounded-xl bg-white shadow-xl'>
        <div className='border-b p-5'>
          <h2 className='text-lg font-semibold'>Select Facebook Pages</h2>
          <p className='mt-1 text-sm text-gray-500'>
            Choose which Pages you want to connect.
          </p>
        </div>

        <div className='max-h-[400px] overflow-y-auto p-5'>
          {loading ? (
            <div className='flex justify-center py-10'>
              <Spinner />
            </div>
          ) : (
            <div className='space-y-3'>
              {pages.map((page) => (
                <label
                  key={page.id}
                  className='flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-gray-50'
                >
                  <div>
                    <p className='font-medium'>{page.name}</p>
                    {page.connected && (
                      <p className='text-xs text-green-600'>
                        Already Connected
                      </p>
                    )}
                  </div>

                  <input
                    type='checkbox'
                    checked={selected.includes(page.id)}
                    disabled={page.connected}
                    onChange={() => togglePage(page.id)}
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        <div className='flex justify-end gap-3 border-t p-5'>
          <Button type='button' onClick={onClose} disabled={saving}>
            Cancel
          </Button>

          <Button
            type='button'
            onClick={handleConnect}
            disabled={saving || loading}
          >
            {saving ? 'Connecting...' : 'Connect Selected'}
          </Button>
        </div>
      </div>
    </div>
  );
}
