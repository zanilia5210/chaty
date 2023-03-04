import { fetchApi } from "./";
import { debug } from "../main/init";
const chatGPTUrl = "https://api.openai.com/v1/chat/completions";
const chatWithGPT = async (messages: any[]) => {
  const headers = {
    Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
  };
  const answer = await fetchApi(
    chatGPTUrl,
    "POST",
    { headers },
    {
      model: "gpt-3.5-turbo",
      messages,
    }
  );
  return answer;
};

const messageManager = (() => {
  let messageMap: Map<any, any[]> = new Map();
  return {
    sendMessage: (content: string, user: string) => {
      if (!messageMap.get(user)) {
        messageMap.set(user, []);
      }
      const data = messageMap.get(user);
      data?.push({ role: "user", content });
    },
    concatAnswer: (content: string, user: string) => {
      if (!messageMap.get(user)) {
        messageMap.set(user, []);
      }
      const data = messageMap.get(user);
      data?.push({ role: "assistant", content });
    },
    getMessages: (user: string) => {
      return messageMap.get(user);
    },
    shiftMessage: (user: string) => {
      const data = messageMap.get(user);
      data?.shift();
    },
    popMessage: (user: string) => {
      const data = messageMap.get(user);
      data?.pop();
    },
    clearMessage: (user: string) => {
      messageMap.delete(user);
    },
  };
})();

export async function resetMessage(user: string) {
  messageManager.clearMessage(user);
}
export async function sendMessage(message: string, user: string) {
  try {
    messageManager.sendMessage(message, user);
    const messages = messageManager.getMessages(user);
    // debug("-----------newMessages----------");
    // debug(messages);
    // debug("-----------newMessages----------");
    const completion = await chatWithGPT(messages!);
    const answer = completion.choices[0].message.content;

    // debug("-----------newAnswers----------");
    // debug(answer);
    // debug("-----------newAnswers----------");
    messageManager.concatAnswer(answer, user);
    return answer;
  } catch (err) {
    messageManager.popMessage(user);
    debug((err as Error).message);
    let errorBody = (err as Error & { response: any })?.response?.data;
    debug(errorBody);
    let append = "[errored]";
    try {
      if (errorBody.error.code === "context_length_exceeded") {
        append = "[errored][context_length_exceeded]";
      }
      errorBody = JSON.stringify(errorBody);
    } catch (_) {}
    return (err as Error).message + "   " + errorBody + "[errored]";
  }
}
