/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs';
import pathUtils from 'path';

import { stripInvalidCharsForDataAttribute } from '@/utils/string';

import { mediaManagementSettingsPageLink } from '@/constants';

import { expect, test } from '@playwright/test';

const validSearchString = 'camp2023';

const BASE_DIR = process.env.CI ? '/tmp' : __dirname;

const e2eTestFolderName = (browserName: string | unknown): string => {
    if (!browserName || typeof browserName !== 'string' || !BASE_DIR) {
        throw new Error('Invalid input for e2eTestFolderName');
    }

    const path = pathUtils.join(BASE_DIR, 'e2e-test-folder', browserName);

    if (!fs.existsSync(path)) {
        console.log(
            `e2e test folder does not exist, running "mkdir -p ${path}"`,
        );
        fs.mkdirSync(path, { recursive: true, mode: '0777' });

        if (!fs.existsSync(path)) {
            throw new Error('Failed to create folder');
        }

        // try to write a file
        try {
            fs.writeFileSync(pathUtils.join(path, 'test-file.txt'), 'test');

            if (!fs.existsSync(pathUtils.join(path, 'test-file.txt'))) {
                throw new Error('Failed to write file');
            } else {
                console.log(
                    `File ${pathUtils.join(path, 'test-file.txt')} written`,
                );
            }

            // read the file
            const data = fs.readFileSync(pathUtils.join(path, 'test-file.txt'));

            if (data.toString() !== 'test') {
                throw new Error('Failed to read file');
            } else {
                console.log(
                    `File ${pathUtils.join(path, 'test-file.txt')} read`,
                );
            }

            console.log('Folder created successfully', browserName);
        } catch (error) {
            console.error('Error writing file:', error);

            throw error;
        }
    }

    return path;
};

test.beforeEach(async ({ browserName }) => {
    console.log('Browser name:', browserName);

    const folder = e2eTestFolderName(browserName);

    console.log('Using folder:', folder);
});

test.describe.configure({
    mode: 'serial',
});

test('should be able to add a root folder', async ({ page, browserName }) => {
    await page.goto('http://localhost:3232');

    // wait for navigation-settings to be visible
    await page.waitForSelector('[data-navigation-slug=settings]');

    // data-testid: navigation-settings
    await page.click('[data-navigation-slug=settings]');

    // expect url to be /settings
    await page.waitForURL('http://localhost:3232/settings');

    // open media management settings
    await page.click('[data-testid=settings-media-management]');

    // expect media-management-settings to be visible
    await page.waitForURL(
        `http://localhost:3232${mediaManagementSettingsPageLink}`,
    );

    const rootFolder = e2eTestFolderName(browserName);

    const areRootFoldersConfigured = page.locator('[data-folder-name]');

    let isOkay = true;

    if (await areRootFoldersConfigured.count()) {
        for await (const folder of await areRootFoldersConfigured.all()) {
            const folderName = await folder.innerText();

            if (folderName === rootFolder) {
                isOkay = false;
                break;
            }
        }
    } else {
        const noRootFolderVisible = await page
            .locator('[data-testid=no-root-folder]')
            .isVisible();

        if (!noRootFolderVisible) {
            isOkay = false;
        }
    }

    expect(isOkay).toBe(true);

    // check for add-folder-button
    const showAddFolderButton = page.locator(
        '[data-testid=show-add-folder-button]',
    );

    await expect(showAddFolderButton).toBeVisible();

    // click on the add folder button
    await showAddFolderButton.click();

    // add-folder-modal
    await expect(page.getByTestId('add-folder-modal')).toBeVisible();

    // add-folder-input
    await expect(page.getByTestId('add-folder-input')).toBeVisible();

    // fill the input field
    await page.fill(
        '[data-testid=add-folder-input]',
        e2eTestFolderName(browserName),
    );

    // submit the form (add-folder-button)
    await page.click('[data-testid=add-folder-button]');

    await expect(page.getByTestId('add-folder-loading')).not.toBeVisible();

    // expect add-folder-helper-text to not be visible
    await expect(page.getByTestId('add-folder-helper-text')).not.toBeVisible();

    await expect(page.getByTestId('add-folder-modal')).not.toBeVisible({
        timeout: 5000, // 5 seconds because it might take a while to fade out
    });

    // notification should be visible
    await expect(page.getByTestId('snackbar')).toBeVisible();
});

test('should be able to search for a string', async ({ page, browserName }) => {
    const { workerIndex } = test.info();

    const rootFolder = e2eTestFolderName(browserName);

    await page.goto('http://localhost:3232');

    // wait for navigation-search to be visible
    await page.waitForSelector('[data-testid=navigation-search]');

    // data-testid: navigation-search
    await page.fill('[data-testid=navigation-search]', validSearchString);

    // make sure the input field has the correct value
    const searchInputValue_0 = await page.getAttribute(
        '[data-testid=navigation-search]',
        'value',
    );

    expect(searchInputValue_0).toBe(validSearchString);

    // focus and press enter
    await page.keyboard.press('Enter');

    // wait for the page to load
    await page.waitForURL('http://localhost:3232/talks/add?search=camp2023');

    // expect "search-results-loading" to be visible
    // NOTE: This could fail if page loads too fast, so if it fails, we might just be fine removing it
    // await expect(page.getByTestId('search-results-loading')).toBeVisible();

    // check if the search string is in the URL
    expect(page.url()).toContain('search=camp2023');

    // expect search-results-error to be hidden
    await expect(page.getByTestId('search-results-error')).not.toBeVisible();

    // check if the search string is in the input field
    const searchInputValue_1 = await page.getAttribute(
        '[data-testid=navigation-search]',
        'value',
    );

    expect(searchInputValue_1).toBe(validSearchString);

    // wait for the search results to load
    await page.waitForSelector('[data-testid=search-item]');

    // expect "search-results-loading" to be hidden
    await expect(page.getByTestId('search-results-loading')).not.toBeVisible();

    // expect search-results-error to be hidden
    await expect(page.getByTestId('search-results-error')).not.toBeVisible();

    // check if there are at least 1 search items (data-testid: search-item)
    const searchItems = await page.locator('[data-testid=search-item]').count();

    // should have enough to index with workerIndex
    expect(searchItems).toBeGreaterThan(workerIndex);

    // get the first search item
    const selectedSearchItem = page
        .locator('[data-testid=search-item]')
        .nth(workerIndex);

    // check if it has the following badges
    const badges = await selectedSearchItem
        .locator('[data-testid=video-meta-badge]')
        .count();

    expect(badges).toBeGreaterThan(0);

    // it should have a badge with the following types: conference, speaker, language, date. others are optional
    const conferenceBadge = await selectedSearchItem
        .locator('[data-badge-type=conference]')
        .count();
    const languageBadge = await selectedSearchItem
        .locator('[data-badge-type=language]')
        .count();
    const dateBadge = await selectedSearchItem
        .locator('[data-badge-type=date]')
        .count();

    const slug = await selectedSearchItem.getAttribute('data-slug');

    expect(slug).not.toBe(null);

    console.log('Slug', slug);

    expect(conferenceBadge).toBeGreaterThan(0);
    expect(languageBadge).toBeGreaterThan(0);
    expect(dateBadge).toBeGreaterThan(0);

    // click on the first search item
    await selectedSearchItem.click();

    // expect add-talk-modal to be visible
    await expect(page.getByTestId('add-talk-modal-inner')).toBeVisible();

    // get "data-add-modal-slug" attribute
    const addModalSlug = await page.getAttribute(
        '[data-testid=add-talk-modal-inner]',
        'data-add-modal-slug',
    );

    expect(addModalSlug).not.toBe(null);

    expect(addModalSlug).not.toBe('');

    // test if it has a add talk button
    const addTalkButton = page.locator('[data-testid=add-talk-button]');

    await expect(addTalkButton).toBeVisible();

    // check if the modal has a close button
    const closeButton = page.locator('[data-testid=add-talk-modal-close]');

    await expect(closeButton).toBeVisible();

    // click the close button
    await closeButton.click();

    // expect add-talk-modal to be hidden
    await expect(page.getByTestId('add-talk-modal')).not.toBeVisible();

    // check if the search string is still in the input field
    const searchInputValue_2 = await page.getAttribute(
        '[data-testid=navigation-search]',
        'value',
    );

    expect(searchInputValue_2).toBe(validSearchString);

    // check if the search items are still visible
    const searchItems_1 = await page
        .locator('[data-testid=search-item]')
        .count();

    expect(searchItems_1).toBeGreaterThan(workerIndex);

    // open the first search item again
    await selectedSearchItem.click();

    // expect add-talk-modal to be visible
    await expect(page.getByTestId('add-talk-modal')).toBeVisible();

    const rootFolderSelect = page.getByTestId('root-folder-select');

    await expect(rootFolderSelect).toBeVisible();

    // click on the select
    await rootFolderSelect.click();

    const selectItem = page.getByTestId(
        `root-folder-${stripInvalidCharsForDataAttribute(rootFolder)}`,
    );

    await expect(selectItem).toBeVisible();

    await selectItem.click();

    // expect "data-selected-root-folder" to be the correct folder
    const selectedRootFolder = await page.getAttribute(
        '[data-testid=add-talk-button]',
        'data-selected-root-folder',
    );

    expect(selectedRootFolder).not.toBe(null);

    expect(selectedRootFolder).toBe(
        stripInvalidCharsForDataAttribute(rootFolder),
    );

    // click the add talk button
    await addTalkButton.click();

    // expect add-talk-modal to be hidden
    await expect(page.getByTestId('add-talk-modal')).not.toBeVisible();

    // expect snackbar to be visible
    await expect(page.getByTestId('snackbar')).toBeVisible();

    // expect snackbar to have a message
    const snackbarMessage = await page
        .locator('[data-testid=snackbar]')
        .innerText();

    expect(snackbarMessage.toLowerCase()).toContain('successfully');

    // navigate to the talks page
    await page.click('[data-navigation-slug=talks]');

    // wait for the page to load
    await page.waitForURL('http://localhost:3232/');

    // expect media-item to be visible
    const items = page.getByTestId('media-item');

    expect(await items.count()).toBeGreaterThan(0);

    // find items where data-media-item-slug matches slug
    const mediaItem = page.locator(`[data-media-item-slug=${slug}]`);

    await expect(mediaItem).toBeVisible();

    // click on the media item
    await mediaItem.click();

    const mediaItemUrl = `http://localhost:3232/talks/${addModalSlug}`;

    console.info('mediaItemUrl', mediaItemUrl);

    // url should be /talks/:slug
    await page.waitForURL(mediaItemUrl);

    // expect data-testid=delete-talk to be visible
    const deleteTalkButton = page.locator('[data-testid=delete-talk]');

    await expect(deleteTalkButton).toBeVisible();

    // click on the button
    await deleteTalkButton.click();

    // url should be talks
    await page.waitForURL('http://localhost:3232/');
});

test('should be able to remove the root folder', async ({
    page,
    browserName,
}) => {
    // directly go to the media management settings page
    await page.goto(`http://localhost:3232${mediaManagementSettingsPageLink}`);

    // expect media-management-settings to be visible
    await page.waitForSelector('[data-testid=media-management-settings]');

    const folderName = e2eTestFolderName(browserName);

    const folderItem = page.locator(`[data-folder-name="${folderName}"]`);

    await expect(folderItem).toBeVisible();

    const removeFolderButton = folderItem.locator(
        '[data-testid=delete-folder-button]',
    );

    await expect(removeFolderButton).toBeVisible();

    // click on the remove folder button
    await removeFolderButton.click();

    // await confirmation modal
    await expect(page.getByTestId('confirmation-modal')).toBeVisible();

    // click on the confirm button
    await page.click('[data-testid=confirm-button]');

    // expect confirmation modal to be hidden
    await expect(page.getByTestId('confirmation-modal')).not.toBeVisible();

    // notification should be visible
    await expect(page.getByTestId('snackbar')).toBeVisible();

    // there should not be a folder item with the path
    await expect(folderItem).not.toBeVisible();

    // refresh page
    await page.reload();

    // should still have no root folder
    const newFolderItem = page.locator(`[data-folder-name="${folderName}"]`);

    await expect(newFolderItem).not.toBeVisible();
});
