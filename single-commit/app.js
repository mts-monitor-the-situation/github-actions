// Dependencies
import { Octokit } from "@octokit/action";
import core from '@actions/core';

// Custom dependencies
import { GetFileSHA, CreateOrUpdateFile } from './libs/action.js';


const main = async () => {

    try {
        // Fetch the inputs
        const path = core.getInput('path', { required: true });
        const commitMessage = core.getInput('message', { required: true });
        const committer = core.getInput('committer', { required: true });
        const committerEmail = core.getInput('committer_email', { required: true });

        // Create Octokit instance
        const octokit = new Octokit({})

        // Get the content of the file
        const fileInfo = await GetFileSHA(octokit, path);

        // Create or update the file
        await CreateOrUpdateFile(octokit, path, fileInfo, commitMessage, committer, committerEmail);
    } catch (err) {
        core.info(`Main error: ${err.message}`);
        throw err
    }
};

main().catch((error) => {
    core.setFailed(error.message);
});