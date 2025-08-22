// Dependencies
import * as github from '@actions/github';
import { Octokit } from "@octokit/action";
import { readFileSync } from 'fs';
import core from '@actions/core';

// Custom dependencies
import { MD5Hash } from './utils.js';

// Extract information from the context
const { repo, } = github.context;
const workspace = process.env.GITHUB_WORKSPACE;

/**
 * Get the commit SHA of a file
 * Ref: https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28
 * @param {Octokit} octokit - The Octokit instance
 * @param {string} path - The relative path to the file
 * @returns {Promise<{sha: string, hash: string} | Error>} - A promise that resolves with the commit SHA and the MD5 hash of the file, or rejects with an error
 */
const GetFileSHA = async (octokit, path) => {
    try {
        // Send the request
        core.debug(`GET: File ${path}`);
        const res = await octokit.request(`GET /repos/${repo.owner}/${repo.repo}/contents/{path}`, {
            path: path,
            headers: {
                // The Accept header is required to get the content in the correct format
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        })

        // Handle the response
        core.debug(`GET: File ${path} status: ${res.status}`);

        return {
            sha: res.data.sha,
            hash: MD5Hash(res.data.content)
        };

    } catch (err) {

        // If the file does not exist, return empty values
        if (err.status === 404) {
            return {
                sha: "",
                hash: ""
            };
        }

        throw err;
    }
};


/**
 * Create or update a file in a repository if the content has changed
 * Ref: https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28
 * @param {Octokit} octokit - The Octokit instance
 * @param {string} path - The relative path to the file
 * @param {{sha: string, hash: string}} upStreamFileInfo - The commit SHA and the MD5 hash of the file from GitHub
 * @param {string} commitMessage - The commit message
 * @param {string} committer - The name of the committer
 * @param {string} committer_email - The email of the committer
 * @returns {Promise<Void | Error>} - A promise that resolves when the file is created or updated, or rejects with an error
 */
const CreateOrUpdateFile = async (octokit, path, upStreamFileInfo, commitMessage, committer, committer_email) => {

    try {
        // Read the file content as base64
        const currentFileContent = readFileSync(`${workspace}/${path}`, { encoding: 'base64' });

        // Check if the file content has changed
        if (upStreamFileInfo.hash === MD5Hash(currentFileContent)) {
            core.info(`File ${path} has not changed`);
            return;
        }

        // Create the request object
        const request = {
            path: path,
            message: commitMessage,
            // The info is obtained from here: https://api.github.com/users/<bot_name>[bot]
            committer: {
                name: committer,
                email: committer_email
            },
            content: currentFileContent,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }

        // If the file already exists, add the last commit SHA to the request
        if (upStreamFileInfo.sha !== "") {
            request.sha = upStreamFileInfo.sha;
        }

        // Send the request
        core.debug(`COMMIT: File ${path}`);
        const res = await octokit.request(`PUT /repos/${repo.owner}/${repo.repo}/contents/{path}`, request)

        // Handle the response
        core.debug(`COMMIT: File ${path} status: ${res.status}`);
        switch (res.status) {
            case 200:
                core.info(`File ${path} updated successfully`);
                break;
            default: // 201
                core.info(`File ${path} created successfully`);
                break;
        }
    } catch (err) {

        switch (err.status) {
            case 404:
                core.info(`COMMIT: File ${path} does not exist`);
                throw new Error(`${path} does not exist`);
            case 422:
                throw new Error('Validation failed or rate limit exceeded');
            default:
                throw err;
        }
    }
};


export { GetFileSHA, CreateOrUpdateFile };