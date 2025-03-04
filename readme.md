# YouTube Tag Generator

A web application that generates optimized YouTube tags based on video content analysis. This tool extracts the transcript from public or unlisted YouTube videos and uses AI to generate relevant tags for better discoverability.

## Features

- Extract transcripts from YouTube videos
- Analyze video content using OpenAI's GPT model
- Generate relevant, SEO-optimized tags
- One-click copy functionality for all tags
- Individual tag copying for selective use

## Demo

You can try the live demo here: [YouTube Tag Generator](https://your-username.github.io/YouTube-Tag-Generator/)

## How It Works

1. Enter the URL of a public or unlisted YouTube video
2. The application extracts the video transcript
3. The transcript is analyzed using OpenAI's API to understand the content
4. Relevant tags are generated based on the content analysis
5. Copy the tags directly to your clipboard

## Setup and Installation

### Prerequisites

- GitHub account
- Netlify account (for the backend functions)
- YouTube Data API key
- OpenAI API key

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/your-username/YouTube-Tag-Generator.git
   cd YouTube-Tag-Generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your API keys:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Deployment

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure environment variables in Netlify dashboard
4. Deploy your application

## Technologies Used

- HTML, CSS, JavaScript
- YouTube Data API
- OpenAI API
- Netlify Functions (serverless backend)

## Privacy Note

This application does not store any video content or transcripts. All processing is done in real-time and data is not persisted beyond the current session.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
