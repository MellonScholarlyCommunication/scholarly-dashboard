import { useState, useEffect } from 'react';
import { getPromiseValueOrUndefined, getProfileData } from '../util/Util'
import { useLiveUpdate, } from '@solid/react';
import { clearCache } from '../singletons/QueryEngine';

const useProfile = function(webId) {
  const liveUpdate = useLiveUpdate(webId)
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true
    const fetchProfile = async () => {
      try {
        await clearCache(webId)
        const profile = await getProfileData(webId)
        if (profile && mounted) {
          profile.webId = webId
          setProfile(profile)
        } else {
          setProfile(null)
        }
      } catch {
        setProfile(null)
      }
    }
    fetchProfile();
    return () => mounted = false
  }, [webId, liveUpdate])
  return profile
}

export default useProfile