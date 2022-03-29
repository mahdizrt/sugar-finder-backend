import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const DEV = process.env.NODE_ENV === "development";
const BOT_TOKEN = DEV ? process.env.BOT_TOKEN_DEV : process.env.BOT_TOKEN_PROD;

const getPhotoUrl = async (photoId: string) => {
  const filePathResponse = await axios.get(
    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${photoId}`
  );
  const filePath = filePathResponse.data.result.file_path;
  const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
  return fileUrl;
};
export { getPhotoUrl };
