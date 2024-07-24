# CrunchyScore - MyAnimeList & AniList Score on Crunchyroll

**CrunchyScore** is available on [Chrome Web Store](https://chrome.google.com/webstore/detail/crunchyscore/coiidbjimmeojgdkclafjccnhgenmmbi)

## Introduction

**CrunchyScore** is a Chrome extension that introduces a new way to explore Crunchyroll.
With CrunchyScore, you can access MyAnimeList and AniList anime ratings directly within Crunchyroll, eliminating the need for extra tabs.

## Features

**CrunchyScore** brings a set of customizable features to enhance your Crunchyroll browsing experience:

### Fetch Scores from API

-   Automatic retrieval of anime scores when browsing Crunchyroll by Crunchyroll ID.

### Display Scores

-   View MyAnimeList and AniList scores beneath each anime card and on individual anime pages.

### Customization Settings

-   Select your preferred score provider MyAnimeList or AniList.
-   Customize how scores are displayed based on your preferences. Options include:
    -   Score Text Color
    -   Score Label
    -   Decimal Precision
    -   Sorting Method

### Integration on Pages

-   The scores are accessible on various pages, including Popular, Newest, Simulcast, and Videos (Genres).

## Usage

To start using **CrunchyScore**, install the extension from the Chrome Web Store. Once installed, right-click on the extension icon to access the settings panel where you can customize the score display according to your needs.

## Source Code

This repository contains the source code for **CrunchyScore**.
The source code is released under the MIT License

To add the build and development instructions to your README for the **CrunchyScore** extension, you can follow this template:

## Build Instructions

### Prerequisites

Before building the extension, ensure you have `node` and `npm` installed on your machine.

### Building the Extension

This project uses `vite` to build for different environments. To build the extension for Chrome or Firefox, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/befabri/crunchyscore.git
    ```
2. Navigate into the project directory:
    ```bash
    cd crunchyscore
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Build the extension for Chrome:
    ```bash
    npm run build:chrome
    ```
5. Build the extension for Firefox:
    ```bash
    npm run build:firefox
    ```

The build artifacts will be located in the `dist` directory under separate folders for each browser.

## Support and Feedback

We welcome any bug reports, feature requests, and general feedback. If you encounter any issues or have any ideas for improving **CrunchyScore**, please create an issue in this repository.
