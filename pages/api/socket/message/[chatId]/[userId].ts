import { getMessages } from "@/lib/service/service";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { redirect } from "next/navigation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method === "GET") {
    try {
      const { chatId } = req.query;
      if (chatId === undefined) {
        redirect("/");
      }
      const result = await getMessages(chatId as string);
      console.log(result);
      res?.socket?.server?.io?.emit("messages", { chatId, messages: result });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
