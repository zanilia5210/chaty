import { confirmReadline } from "../../utils";
import { resetMessage, sendMessage } from "../../utils/gptTurboApi";

export const runCommandLineService = async () => {
  let stop = false;
  const user = "user";
  while (!stop) {
    const { answer, close } = await confirmReadline(
      "please input your question: ",
      /ye/gim
    );
    if (answer.trim() === "") {
      console.clear();
      continue;
    }
    if (/exit|quit|退出/gim.test(answer)) {
      stop = true;
      close()
      break;
    }
    if (/reset|重置/gim.test(answer)) {
      await resetMessage(user);
      continue;
    }
    console.log("\x1b[36m%s\x1b[0m", answer);
    const res = await sendMessage(answer!, user);
    console.log("\x1b[33m%s\x1b[0m", res);
  }
  console.log('结束了')
};
