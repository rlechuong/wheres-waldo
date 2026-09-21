const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
if (!CLOUD_NAME) throw new Error("VITE_CLOUDINARY_CLOUD_NAME is not set.");

type ImageOptions = { width?: number };

const cloudinaryUrl = (publicId: string, { width }: ImageOptions = {}) => {
  const transforms = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
};

export { cloudinaryUrl };
