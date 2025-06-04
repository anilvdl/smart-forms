export async function blobUrlToDataUrl(blobUrl: string): Promise<string> {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject('Failed to convert blob');
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }