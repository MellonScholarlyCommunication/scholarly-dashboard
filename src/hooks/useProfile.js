import { useState, useEffect } from 'react';
import { useLiveUpdate, } from '@solid/react';
import { clearCache } from '../singletons/QueryEngine';
import { fetchProfile } from '../util/MellonUtils/profile'

const useProfile = function(webId) {
  const [profile, setProfile] = useState(null);
  const liveUpdate = useLiveUpdate(webId)

  useEffect(() => {
    let mounted = true
    const getProfile = async () => {
      if(!webId) return
      await clearCache(webId)
      const profile = await fetchProfile(webId)
      if (mounted) {
        if(profile) {
          profile.webId = webId
          setProfile(profile)
        } else {
          setProfile(null)
        }
      } 
    }
    getProfile();
    return () => mounted = false
  }, [webId, liveUpdate])
  return profile
}

export default useProfile