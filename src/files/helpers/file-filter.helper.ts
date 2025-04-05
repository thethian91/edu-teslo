export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
  if (!file) return callback(new Error('File is empty'), false);

  const { mimetype } = file;

  const fileExtension = mimetype.split('/')[1];
  const validExtension = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico', 'heic'];

  if (validExtension.includes(fileExtension)) return callback(null, true);
  callback(null, false);
};
