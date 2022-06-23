// Whatsapp Chatbot using gpt-3 model and whatsapp-web.js
// A chatbot that can respond to you girl friend when you are not available

import fs from "fs";
import path from "path";
const __dirname = path.resolve();
import qrcode from "qrcode-terminal";
import openaia from "openai";
const { Configuration, OpenAIApi } = openaia;
import whatsapp from "whatsapp-web.js";
const { Client, LocalAuth } = whatsapp;

// setting default parameters so that gpt 3 can understand about the situation
const defaultPrompt4Sara = `Sara:Can you remember a few things for me?
Yadhu:Of course!
Sara:I am Sara. Your name is Yadhu. we boath are in relationship.
Yadhu:I will remember that.`;

const contacts = {
  // give her phone number here format 91 => Contry code, 10 digit Number =>9876543210, then @c.us
  sara: "919876543210@c.us",
};

// use this function to write log files to track any conversations
const writeToFile = (data) => {
  let filename = new Date().toString();
  filename =
    filename
      .substring(0, filename.indexOf("G"))
      .trim()
      .replaceAll(" ", "_")
      .replaceAll(":", "-") + ".txt";
  fs.writeFileSync(__dirname + "\\logFiles\\" + filename, data);
};

// open AI Setup
const configuration = new Configuration({
  // add the openAI API key here
  apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
});

const openai = new OpenAIApi(configuration);
let prompt = "";

async function callOpenAI(message) {
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: message,
    temperature: 0.5,
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
    stop: ["You:"],
  });
  return response;
}

// Use the saved values for local Auth to avaoid scaning qr code everytime
// modew details can be found in whatsapp-web.js website
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!\n setting prompt for Sara\n");
  prompt = defaultPrompt4Sara;
});

client.on("message", (message) => {
  console.log(message.from + " : " + message.body);

  // filtering messages only of sara
  if (message.from === contacts.sara) {
    prompt = prompt + "\nSara: " + message.body + "\nYadhu:";
    callOpenAI(prompt).then((response) => {
      console.log(
        "\nfull Choices" + JSON.stringify(response.data.choices) + "\n"
      );
      let responseMsg = response.data.choices[0].text.trim();

      // Sometimes GTP3 is responding from my side as well as saras side use below code if that happens
      // if (responseMsg.indexOf("\n") >= 0) {
      //   console.log("\n\\n found in responce");
      //   console.log(
      //     "full Choices has \\n" + JSON.stringify(response.data.choices)
      //   );
      //   console.log("Responce text:" + responseMsg);
      //   let data =
      //     prompt +
      //     " \nLast responce from openAI is => " +
      //     responseMsg +
      //     "\n it has \\n at index " +
      //     responseMsg.indexOf("\n");
      //   writeToFile(data);
      //   responseMsg = responseMsg.substring(0, responseMsg.indexOf("\n"));
      //   console.log("\n\n\nError logged please Check \n\n\n");
      // }
      client.sendMessage(message.from, responseMsg);
      prompt = prompt + responseMsg;
      console.log(prompt);
    });
  }
});

client.initialize();
