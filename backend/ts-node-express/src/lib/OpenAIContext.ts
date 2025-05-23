import OpenAI from "openai";
const client = new OpenAI();

/**
 * 
 * TODO:
 * 1. Make the context check if the input is something it doesnt have and need to reach into the db context
 * 
 */

export const OpenAIContext = async (inputText: string) => {

    const response = await client.responses.create({
        model: "gpt-4.1",
        input: inputText
    })

    console.log(response.output_text)

}