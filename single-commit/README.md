# single-commit Action
This action automatically creates or updates a **SINGLE** file in a repository. The commit is signed directly by GitHub.

## Inputs

### `path`
**Required** The relative path from the repository root to the file without leading or trailing slashes and dots.

## `committer`
**Required** The name of the committer. The format of <bot_name>[bot]. You can view the details of your bot at https://api.github.com/users/<bot_name>[bot]

## `committer_email`
**Required** The email of the committer. The format is <bot_id+bot_name>[bot]@users.noreply.github.com. You can view the details of your bot at https://api.github.com/users/<bot_name>[bot]

### `message`
**Required** The commit message.

## Example usage

```yaml
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Get GitHub App Token
        uses: actions/create-github-app-token@v1
        id: github-app-token
        with:
          owner: ${{ github.repository_owner }}
          app-id: ${{ vars.GITHUB_APP_ID }}
          private-key: ${{ secrets.GITHUB_APP_PRIVATE_KEY }}

      - name: Update README.md
        run: |
          echo "Updated README.md" >> README.md
        shell: bash

      - name: Commit File
        uses: mts-monitor-the-situation/github-actions/single-commit@main
        with:
          path: "README.md"
          committer: "<your_bot_name>[bot]"
          committer_email: "<your_bot_id+your_bot_name>[bot]@users.noreply.github.com"
          message: "Update README.md"
        env:
          GITHUB_TOKEN: ${{ steps.github-app-token.outputs.token }}
```
## Note
This action is written in JavaScript and is bundled using [ncc](https://www.npmjs.com/package/@vercel/ncc). 