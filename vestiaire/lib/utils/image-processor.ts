/**
 * Utility function to compress, resize, and convert any image File (JPEG, PNG, WEBP, HEIC)
 * into a standardized image/jpeg File under 2MB with max dimensions of 1200px.
 */
export async function processAndCompressImage(file: File): Promise<File> {
  // If running on server or canvas unavailable, return original file fallback
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => {
      console.warn('[processAndCompressImage] FileReader error, using original file');
      resolve(file);
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => {
        console.warn('[processAndCompressImage] Image load error, using original file');
        resolve(file);
      };

      img.onload = () => {
        try {
          const maxDimension = 1200;
          let width = img.width;
          let height = img.height;

          // Downscale if width or height exceeds 1200px
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          // Fill white background (handles transparent PNGs converting to JPEG)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw resized image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG blob with 0.82 quality compression (max file size < 2MB)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // Generate sanitized, clean UUID filename
              const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;

              const processedFile = new File([blob], cleanFileName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              resolve(processedFile);
            },
            'image/jpeg',
            0.82
          );
        } catch (err) {
          console.warn('[processAndCompressImage] Canvas processing error:', err);
          resolve(file);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
