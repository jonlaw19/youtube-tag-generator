document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const generateBtn = document.getElementById('generateBtn');
    const loadingSection = document.getElementById('loading');
    const resultsSection = document.getElementById('results');
    const tagsContainer = document.getElementById('tagsContainer');
    const tagsText = document.getElementById('tagsText');
    const copyBtn = document.getElementById('copyBtn');
    const errorSection = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');

    // Set up API key (set up securely in production)
    const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY';
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

    generateBtn.addEventListener('click', async () => {
        const videoUrl = videoUrlInput.value.trim();
        
        if (!videoUrl) {
            showError('Please enter a YouTube video URL');
            return;
        }

        // Extract video ID from URL
        const videoId = extractVideoId(videoUrl);
        
        if (!videoId) {
            showError('Invalid YouTube URL. Please enter a valid YouTube video URL');
            return;
        }

        // Show loading, hide results and errors
        loadingSection.style.display = 'flex';
        resultsSection.style.display = 'none';
        errorSection.style.display = 'none';

        try {
            // Step 1: Get video details
            const videoDetails = await getVideoDetails(videoId);
            
            // Step 2: Get video transcript
            const transcript = await getVideoTranscript(videoId);
            
            // Step 3: Generate tags using OpenAI
            const tags = await generateTags(videoDetails, transcript);
            
            // Step 4: Display results
            displayTags(tags);
            
            // Hide loading, show results
            loadingSection.style.display = 'none';
            resultsSection.style.display = 'block';
        } catch (error) {
            loadingSection.style.display = 'none';
            showError(error.message || 'An error occurred while processing your request');
        }
    });

    copyBtn.addEventListener('click', () => {
        tagsText.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy All Tags';
        }, 2000);
    });

    function extractVideoId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }

    async function getVideoDetails(videoId) {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`);
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found or is private');
        }
        
        return data.items[0].snippet;
    }

    async function getVideoDetails(videoId) {
        try {
            // Instead of calling YouTube API directly, use our Netlify function
            const response = await fetch('/api/get-transcript', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoId })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process video');
            }
            
            const data = await response.json();
            return data.videoDetails;
        } catch (error) {
            console.error('Error fetching video details:', error);
            throw error;
        }
    }

    async function getVideoTranscript(videoId) {
        // This function is now redundant as we're getting everything in one call,
        // but keeping it for code structure consistency
        return ""; // Actual transcript is retrieved in the getVideoDetails function
    }

    async function generateTags(videoDetails, transcript) {
        // Instead of making separate calls to OpenAI, we'll get the tags from our Netlify function
        // The function has already processed everything and returned the tags
        try {
            const response = await fetch('/api/get-transcript', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoId: extractVideoId(videoUrlInput.value) })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate tags');
            }
            
            const data = await response.json();
            return data.tags;
        } catch (error) {
            console.error('Error generating tags:', error);
            throw error;
        }
    }

    function displayTags(tags) {
        // Clear previous tags
        tagsContainer.innerHTML = '';
        
        // Add each tag as an element
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.classList.add('tag');
            tagElement.textContent = tag;
            
            tagElement.addEventListener('click', () => {
                // Copy individual tag when clicked
                navigator.clipboard.writeText(tag);
                
                // Visual feedback
                const originalBackground = tagElement.style.backgroundColor;
                tagElement.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    tagElement.style.backgroundColor = originalBackground;
                }, 500);
            });
            
            tagsContainer.appendChild(tagElement);
        });
        
        // Update textarea with all tags
        tagsText.value = tags.join(', ');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorSection.style.display = 'block';
        loadingSection.style.display = 'none';
        resultsSection.style.display = 'none';
    }
});
