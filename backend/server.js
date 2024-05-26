//import modules: express, dotenv
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();

//accept json data in requests
app.use(express.json());
app.use(cors());

//setup environment variables
dotenv.config();

//OpenAIApi Configuration
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
//build openai instance using OpenAIApi
const openai = new OpenAIApi(configuration);

//build the runCompletion which sends a request to the OPENAI Completion API
async function runCompletion(request, prompt) {
  const response = await openai.createCompletion({
    model: "gpt-3.5-turbo-instruct",
    prompt: `${prompt} ${request}`,
    max_tokens: 100,
  });
  return response;
}
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//post request to /api/chatgpt
app.post("/api/chatgpt", async (req, res) => {
  console.log(req.body);
  try {
    //extract the text from the request body
    const { text, prompt } = req.body;

    // Pass the request text to the runCompletion function
    const completion = await runCompletion(text, prompt);

    // Return the completion as a JSON response

    res.json({ data: completion.data });
  } catch (error) {
    //handle the error in the catch statement
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error("Error with OPENAI API request:", error.message);
      res.status(500).json({
        error: {
          message: "An error occured during your request.",
        },
      });
    }
  }
});

app.post("/api/createimages", async (req, res) => {
  //extract the text input from the request body
  const { text, prompt } = req.body;
  console.log(req.body);
  //createImages
  async function createImages() {
    const response = await openai.createImage({
      model: "dall-e-3",
      prompt: `${prompt} ${text}`,
      n: 1,
      size: "1024x1024",
      response_format: "url", //default
    });
    return response;
  }
  try {
    const { text, prompt } = req.body;

    // Pass the request text to the runCompletion function
    const output = await createImages();

    // Return the completion as a JSON response
    res.json(output.data);
  } catch (error) {
    console.error("An error occured :", error);
    res.status(500).json({ error });
  }
});

//set the PORT
const PORT = process.env.PORT || 8000;

//start the server on the chosen PORT
app.listen(PORT, console.log(`Server started on port ${PORT}`));
