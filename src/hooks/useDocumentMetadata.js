import { useState, useEffect } from 'react';
import { useLiveUpdate, } from '@solid/react';
import { clearCache } from '../singletons/QueryEngine';
import { getDocumentMetadata } from '../util/MellonUtils/documents';

const useDocumentMetadata = function(documentId, metadataId) {
  const [metadata, setMetadata] = useState(null);
  const liveUpdate = useLiveUpdate(metadataId)

  useEffect(() => {
    let mounted = true
    const getMetadata = async () => {
      if(!metadataId) return
      await clearCache(metadataId)
      getDocumentMetadata(documentId, metadataId).then(metadata => {
        if (metadata && mounted) setMetadata(metadata)
      })
    }
    getMetadata();
    return () => mounted = false
  }, [metadataId, liveUpdate])
  return metadata
}

export default useDocumentMetadata