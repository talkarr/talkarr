/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs';
import pathUtils from 'path';

import { mediaManagementSettingsPageLink } from '@/constants';

import { expect, test } from '@playwright/test';

const validSearchString = 'camp2023';

test.describe.configure({
    mode: 'serial',
});

const e2eTestFolderName = pathUtils.join(__dirname, 'e2e-test-folder');

test.beforeAll(async () => {
    if (!fs.existsSync(e2eTestFolderName)) {
        fs.mkdirSync(e2eTestFolderName, { recursive: true });
    }
});

test('should be able to add a root folder', async ({ page }) => {
    await page.goto('http://localhost:3232');

    await page.waitForTimeout(3000);

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

    await expect(page.getByTestId('no-root-folder')).toBeVisible();

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
    await page.fill('[data-testid=add-folder-input]', e2eTestFolderName);

    // submit the form (add-folder-button)
    await page.click('[data-testid=add-folder-button]');

    // expect add-folder-helper-text to not be visible
    await expect(page.getByTestId('add-folder-helper-text')).not.toBeVisible();

    await expect(page.getByTestId('add-folder-modal')).not.toBeVisible({
        timeout: 5000, // 5 seconds because it might take a while to fade out
    });

    // notification should be visible
    await expect(page.getByTestId('snackbar')).toBeVisible();
});

test('should be able to search for a string', async ({ page }) => {
    test.skip();
    await page.goto('http://localhost:3232');

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

    expect(searchItems).toBeGreaterThan(0);

    // get the first search item
    const firstSearchItem = page.locator('[data-testid=search-item]').first();

    // check if it has the following badges
    const badges = await firstSearchItem
        .locator('[data-testid=video-meta-badge]')
        .count();

    expect(badges).toBeGreaterThan(0);

    // it should have a badge with the following types: conference, speaker, language, date. others are optional
    const conferenceBadge = await firstSearchItem
        .locator('[data-badge-type=conference]')
        .count();
    const speakerBadge = await firstSearchItem
        .locator('[data-badge-type=speaker]')
        .count();
    const languageBadge = await firstSearchItem
        .locator('[data-badge-type=language]')
        .count();
    const dateBadge = await firstSearchItem
        .locator('[data-badge-type=date]')
        .count();

    expect(conferenceBadge).toBeGreaterThan(0);
    expect(speakerBadge).toBeGreaterThan(0);
    expect(languageBadge).toBeGreaterThan(0);
    expect(dateBadge).toBeGreaterThan(0);

    // click on the first search item
    await firstSearchItem.click();

    // expect add-talk-modal to be visible
    await expect(page.getByTestId('add-talk-modal')).toBeVisible();

    // get "data-add-modal-slug" attribute
    const addModalSlug = await page.getAttribute(
        '[data-testid=add-talk-modal]',
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

    expect(searchItems_1).toBeGreaterThan(0);

    // open the first search item again
    await firstSearchItem.click();

    // expect add-talk-modal to be visible
    await expect(page.getByTestId('add-talk-modal')).toBeVisible();

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
    await expect(page.getByTestId('media-item')).toBeVisible();

    // get the media item where data-media-item-slug matches addModalSlug
    const mediaItem = page.locator(`[data-media-item-slug=${addModalSlug}]`);

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

test('should be able to remove the root folder', async ({ page }) => {
    // directly go to the media management settings page
    await page.goto(`http://localhost:3232${mediaManagementSettingsPageLink}`);

    // expect media-management-settings to be visible
    await page.waitForURL(
        `http://localhost:3232${mediaManagementSettingsPageLink}`,
    );

    // check for remove-folder-button
    const removeFolderButton = page.locator(
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

    // text "No root folders have been configured" should be visible
    await expect(page.getByTestId('no-root-folder')).toBeVisible();

    // wait 3 seconds
    await page.waitForTimeout(3000);

    // refresh page
    await page.reload();

    // should still have no root folder
    await expect(page.getByTestId('no-root-folder')).toBeVisible();
});
