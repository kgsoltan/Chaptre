import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadProfilePicture = async (file, authorId) => {
  const storage = getStorage();
  const storageRef = ref(storage, `profile_pictures/${authorId}`);

  // Upload file
  await uploadBytes(storageRef, file);

  // Get download URL
  return await getDownloadURL(storageRef);
};
