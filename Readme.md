# ChatGPT Firefox Extension

This extension enhances your web browsing experience by adding some features to interact with chat.openai.com.

## Features

- Change favicon based on the response state
- Detect if page needs refresh
- Keep a counter for how many requests have been done in the last hour

## Installation

Follow these steps to install the ChatGPT Firefox Extension as a temporary add-on:

1. Download the XPI file from the source
2. Open Firefox and navigate to about:debugging
3. Click on "Load Temporary Add-on" and select the downloaded XPI file
4. The extension should now be installed and active in your browser

## Usage

- Once the extension is installed, it will automatically detect when you are visiting chat.openai.com and start working.
- You can observe the changes in the favicon, the counter and the refresh status of the page.
- The extension stores data such as the counter using localStorage and it will be available across browser sessions.

## Notes

This is a simple example and not intended for production use. Use it at your own risk.

## Contributions

Contributions are welcome. Feel free to submit a pull request or create an issue for any bug you find.