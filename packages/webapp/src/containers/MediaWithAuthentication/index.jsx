import { useEffect, useState } from 'react';
import { mediaEnum } from './constants';
import { ReactComponent as Download } from '../../assets/images/farmMapFilter/Download.svg';

export function MediaWithAuthentication({
  fileUrl = '',
  title = '',
  mediaType = mediaEnum.IMAGE,
  ...props
}) {
  const [mediaUrl, setMediaUrl] = useState();
  useEffect(() => {
    const config = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('farm_token'),
      },
      responseType: 'arraybuffer',
      method: 'GET',
    };
    let subscribed;
    const getImageSrc = async () => {
      try {
        subscribed = true;
        const url = new URL(fileUrl);
        url.hostname = 'images.litefarm.workers.dev';
        const response = await fetch(url.toString(), config);
        const blobFile = await response.blob();
        subscribed && setMediaUrl(URL.createObjectURL(blobFile));
      } catch (e) {
        console.log(e);
      }
    };
    getImageSrc();
    return () => (subscribed = false);
  }, []);

  const handleClick = () => {
    const element = document.createElement('a');
    element.href = mediaUrl;
    element.download = title;
    document.body.appendChild(element);
    element.click();
  };

  const renderMediaComponent = () => {
    switch (mediaType) {
      case mediaEnum.DOCUMENT: {
        return <Download onClick={handleClick} {...props} />;
      }
      case mediaEnum.IMAGE:
      default: {
        return <img loading="lazy" src={mediaUrl} {...props} />;
      }
    }
  };

  return renderMediaComponent();
}
