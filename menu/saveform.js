const { Octokit } = require("@octokit/rest");

exports.handler = async (event, context) => {
    const { phrase, description, contactInfo } = JSON.parse(event.body);

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });

    const owner = "your-github-username";
    const repo = "your-repo-name";
    const path = "data/formResponses.json";
    const branch = "main";

    try {
        // Get the current file content
        const { data: { sha, content } } = await octokit.repos.getContent({
            owner,
            repo,
            path,
            ref: branch,
        });

        // Decode and parse the existing content
        const existingContent = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));

        // Add the new form response
        existingContent.push({ phrase, description, contactInfo });

        // Encode the updated content
        const updatedContent = Buffer.from(JSON.stringify(existingContent, null, 2)).toString('base64');

        // Commit the changes
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: "Add new form response",
            content: updatedContent,
            sha,
            branch,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Form response saved successfully!" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error saving form response", error: error.message }),
        };
    }
};