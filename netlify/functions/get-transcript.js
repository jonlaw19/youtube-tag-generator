const axios = require('axios');
const { YoutubeTranscript } = require('youtube-transcript');
const { Configuration, OpenAIApi } = require("openai");

exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Preflight call successful' }),
    };
  }

  // Check if this is a POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { videoId } = requestBody;

    if (!videoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'videoId is required' }),
      };
    }

    // Get YouTube API key from environment variables
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!YOUTUBE_API_KEY || !OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API keys not configured' }),
      };
    }

    // Step 1: Get video details from YouTube API
    const videoResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Video not found or is private' }),
      };
    }

    const videoDetails = videoResponse.data.items[0].snippet;

    // Step 2: Get video transcript
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcriptData || transcriptData.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Transcript not available for this video' }),
      };
    }

    // Convert transcript data to plain text
    const transcript = transcriptData
      .map(item => item.text)
      .join(' ');

    // Step 3: Use OpenAI to generate tags
    const configuration = new Configuration({
      apiKey: OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const prompt = `
    Generate 15-20 relevant YouTube tags based on the following video content:
    
    Title: ${videoDetails.title}
    Description: ${videoDetails.description}
    
    Transcript excerpt:
    ${transcript.substring(0, 4000)}...
    
    Generate tags that are relevant to the video content, are popular search terms, and would help with YouTube SEO.
    Return only the tags separated by commas without any other text.
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a YouTube SEO expert that generates relevant tags based on video content."},
        {role: "user", content: prompt}
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const tagsString = completion.data.choices[0].message.content.trim();
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        videoDetails: {
          title: videoDetails.title,
          description: videoDetails.description,
          thumbnails: videoDetails.thumbnails
        },
        transcript: transcript.substring(0, 1000) + '...',
        tags
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'An error occurred processing your request',
        details: error.message
      }),
    };
  }
};
