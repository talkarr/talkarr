/* eslint-disable @typescript-eslint/naming-convention,playwright/no-wait-for-selector,playwright/no-wait-for-timeout */
import fs from 'node:fs';
import pathUtils from 'node:path';

import { stripInvalidCharsForDataAttribute } from '@/utils/string';

import { mediaManagementSettingsPageLink } from '@/constants';

import { expect, test as base } from '@playwright/test';

const validSearchString = 'camp2023';

const BASE_DIR = pathUtils.join(__dirname, '..');

export interface TestOptions {
    searchItemIndex: number;
}

const test = base.extend<TestOptions>({
    searchItemIndex: [-1, { option: true }],
});

const e2eTestFolderName = (name: string | unknown): string => {
    if (!name || typeof name !== 'string' || !BASE_DIR) {
        throw new Error('Invalid input for e2eTestFolderName');
    }

    // make name all lower case and replace invalid chars with _
    const formatted = name.toLowerCase().replaceAll(/[^a-z0-9]/g, '_');

    const path = pathUtils.join(BASE_DIR, 'e2e-test-folder', formatted);

    // check if base dir exists and can do read/write
    if (!fs.existsSync(BASE_DIR)) {
        throw new Error('Base directory does not exist');
    }

    // eslint-disable-next-line no-bitwise
    fs.accessSync(BASE_DIR, fs.constants.R_OK | fs.constants.W_OK);

    if (!fs.existsSync(path)) {
        console.log(
            `e2e test folder does not exist, running "mkdir -p ${path}"`,
        );
        fs.mkdirSync(path, { recursive: true, mode: '0777' });

        if (!fs.existsSync(path)) {
            throw new Error('Failed to create folder');
        }

        // try to write a file
        fs.writeFileSync(pathUtils.join(path, 'test-file.txt'), 'test');

        if (fs.existsSync(pathUtils.join(path, 'test-file.txt'))) {
            console.log(
                `File ${pathUtils.join(path, 'test-file.txt')} written`,
            );
        } else {
            throw new Error('Failed to write file');
        }

        // read the file
        const data = fs.readFileSync(pathUtils.join(path, 'test-file.txt'));

        if (data.toString() === 'test') {
            console.log(`File ${pathUtils.join(path, 'test-file.txt')} read`);
        } else {
            throw new Error('Failed to read file');
        }

        console.log('Folder created successfully', formatted);
    }

    console.log('Using folder for e2e tests:', path);

    if (!process.env.CI) {
        return path;
    }

    // replace BASE_DIR with "/app" for CI
    return path.replace(BASE_DIR, '/app/e2e');
};

test.describe.configure({
    mode: 'serial',
});

test('should be able to add a root folder', async ({
    page,
    isMobile,
}, testInfo) => {
    await page.goto('http://localhost:3232');

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (isMobile) {
        const mobileNavigationDrawerToggle = page.locator(
            '[data-testid=mobile-navigation-drawer-toggle]',
        );
        // eslint-disable-next-line playwright/no-conditional-expect
        await expect(mobileNavigationDrawerToggle).toBeVisible();

        await mobileNavigationDrawerToggle.click();
    }

    const container = page.locator(
        isMobile
            ? '[data-testid=navigation-mobile]'
            : '[data-testid=navigation-desktop]',
    );

    await expect(container).toBeVisible();

    // data-testid: navigation-settings
    const navigationSettings = container.locator(
        '[data-navigation-slug=settings]',
    );

    await expect(navigationSettings).toBeVisible();

    await navigationSettings.click();

    // wait for load
    await page.waitForLoadState('domcontentloaded');

    // expect settings to be visible
    const settings = page.locator('[data-testid=settings]');

    await expect(settings).toBeVisible();

    // open media management settings
    const mediaManagementSettings = page.locator(
        '[data-testid=settings-media-management]',
    );

    await expect(mediaManagementSettings).toBeVisible();

    await mediaManagementSettings.click();

    // expect media-management-settings to be visible
    await page.waitForURL(
        `http://localhost:3232${mediaManagementSettingsPageLink}`,
    );

    const rootFolder = e2eTestFolderName(testInfo.project.name);

    const areRootFoldersConfigured = page.locator('[data-folder-name]');

    let isOkay = true;

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (await areRootFoldersConfigured.count()) {
        for await (const folder of await areRootFoldersConfigured.all()) {
            const folderName = await folder.textContent();

            // eslint-disable-next-line playwright/no-conditional-in-test
            if (folderName === rootFolder) {
                isOkay = false;
                break;
            }
        }
    } else {
        const noRootFolderVisible = await page
            .locator('[data-testid=no-root-folder]')
            .isVisible();

        // eslint-disable-next-line playwright/no-conditional-in-test
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

    const inputField = page.locator('[data-testid=add-folder-input]');

    await expect(inputField).toBeVisible();

    // fill the input field
    await inputField.fill(e2eTestFolderName(testInfo.project.name));

    // submit the form (add-folder-button)
    await page.click('[data-testid=add-folder-button]');

    await expect(page.getByTestId('add-folder-loading')).toBeHidden();

    // expect add-folder-helper-text to not be visible
    await expect(page.getByTestId('add-folder-helper-text')).toBeHidden();

    await expect(page.getByTestId('add-folder-modal')).not.toBeVisible({
        timeout: 5000, // 5 seconds because it might take a while to fade out
    });

    // notification should be visible
    await expect(page.getByTestId('snackbar')).toBeVisible();

    // reload page
    await page.reload({
        waitUntil: 'domcontentloaded',
    });

    // expect media-management-settings to be visible
    await page.waitForSelector('[data-testid=media-management-settings]');

    const folderName = e2eTestFolderName(testInfo.project.name);

    const folderItem = page.locator(`[data-folder-name="${folderName}"]`);

    await expect(folderItem).toBeVisible();
});

test('should be able to search for a string', async ({
    page,
    searchItemIndex,
    browserName,
    isMobile,
}, testInfo) => {
    const logs: { msg: string; type: string }[] = [];

    page.on('console', msg => {
        console.info('Console log:', msg.text());
        logs.push({ msg: msg.text(), type: msg.type() });
    });

    expect(searchItemIndex).toBeGreaterThan(-1);

    console.log('searchItemIndex', searchItemIndex);

    const rootFolder = e2eTestFolderName(testInfo.project.name);

    await page.goto('http://localhost:3232');

    // wait for navigation-search to be visible
    await page.waitForSelector('[data-testid=navigation-search]');

    // data-testid: navigation-search
    const navigationSearch = page.locator('[data-testid=navigation-search]');

    await expect(navigationSearch).toBeVisible();

    await navigationSearch.fill(validSearchString);

    // replace with web-first
    await expect(navigationSearch).toHaveAttribute('value', validSearchString);

    // focus and press enter
    await page.keyboard.press('Enter');

    // wait for the page to load
    await page.waitForURL('http://localhost:3232/talks/add?search=camp2023', {
        waitUntil: 'domcontentloaded',
    });

    // check if the search string is in the URL
    expect(page.url()).toContain('search=camp2023');

    // wait for the search results to load
    await page.waitForSelector('[data-testid=search-results]', {
        // wait 60s
        timeout: 60 * 1000,
    });

    // expect search-results-error to be hidden
    const error = page.getByTestId('search-results-error');
    expect(await error.count()).toBe(0);

    // check if the search string is in the input field
    const navigationSearch_1 = page.locator('[data-testid=navigation-search]');

    await expect(navigationSearch_1).toHaveAttribute(
        'value',
        validSearchString,
    );

    // expect "search-results-loading" to be hidden
    await expect(page.getByTestId('search-results-loading')).toBeHidden();

    // expect search-results-error to be hidden
    await expect(page.getByTestId('search-results-error')).toBeHidden();

    // check if there are at least 1 search items (data-testid: search-item)
    const searchItemsCount = await page
        .locator('[data-testid=search-item]')
        .count();

    // should have enough to index with workerIndex
    expect(searchItemsCount).toBeGreaterThan(searchItemIndex);

    // get the first search item
    const selectedSearchItem = page
        .locator('[data-testid=search-item]')
        .nth(searchItemIndex);

    // scroll it into view
    await selectedSearchItem.scrollIntoViewIfNeeded();

    await expect(selectedSearchItem).toBeVisible();

    // selectedSearchItem should not have data-is-already-added="true"
    await expect(selectedSearchItem).toHaveAttribute(
        'data-is-already-added',
        'false',
    );

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

    await expect(selectedSearchItem).toHaveAttribute('data-slug');

    // get the slug
    const slug = await selectedSearchItem.getAttribute('data-slug');

    // slug should have length of > 0
    expect(slug?.length).toBeGreaterThan(0);

    console.log('Slug', { slug, searchItemIndex, browserName });

    expect(conferenceBadge).toBeGreaterThan(0);
    expect(languageBadge).toBeGreaterThan(0);
    expect(dateBadge).toBeGreaterThan(0);

    const selectedItemDescription = selectedSearchItem.locator(
        '[data-testid=search-item-description]',
    );

    await expect(selectedItemDescription).toBeVisible();

    await selectedItemDescription.click({
        delay: 80,
    });

    // expect add-talk-modal to be visible
    await expect(page.getByTestId('add-talk-modal')).toBeVisible();

    // expect add-talk-modal to be visible
    await expect(page.getByTestId('add-talk-modal-inner')).toBeVisible();

    // get "data-add-modal-slug" attribute
    const addModalInner = page.getByTestId('add-talk-modal-inner');

    await expect(addModalInner).toBeVisible();

    await expect(addModalInner).toHaveAttribute('data-add-modal-slug');

    // test if it has a add talk button
    const addTalkButton = page.locator('[data-testid=add-talk-button]');

    await expect(addTalkButton).toBeVisible();

    // check if the modal has a cancel button
    const cancelButton = page.locator('[data-testid=cancel-button]');

    await expect(cancelButton).toBeVisible();

    // click the cancel button
    await cancelButton.click();

    await page.getByTestId('add-talk-loading').waitFor({ state: 'hidden' });

    // expect add-talk-modal to be hidden
    await expect(page.getByTestId('add-talk-modal')).toBeHidden();

    // check if the search string is still in the input field
    const searchInput_2 = page.locator('[data-testid=navigation-search]');

    await expect(searchInput_2).toHaveAttribute('value', validSearchString);

    // check if the search items are still visible
    const searchItems_1 = await page
        .locator('[data-testid=search-item]')
        .count();

    expect(searchItems_1).toBeGreaterThan(searchItemIndex);

    const selectedSearchItem_1 = page
        .locator('[data-testid=search-item]')
        .nth(searchItemIndex);

    await expect(selectedSearchItem_1).toBeVisible();

    // click on the first search item
    const selectedItemAction_1 = selectedSearchItem_1.locator(
        '[data-testid=search-item-action]',
    );

    await expect(selectedItemAction_1).toBeVisible();

    // open the first search item again
    await selectedItemAction_1.click({
        delay: 80,
        position: {
            x: 10,
            y: 10,
        },
    });

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
    const addTalkButton_2 = page.locator('[data-testid=add-talk-button]');

    await expect(addTalkButton_2).toBeVisible();

    await expect(addTalkButton_2).toHaveAttribute(
        'data-selected-root-folder',
        stripInvalidCharsForDataAttribute(rootFolder),
    );

    // click the add talk button
    await addTalkButton_2.click();

    await page.getByTestId('add-talk-loading').waitFor({ state: 'hidden' });

    // expect add-talk-modal to be hidden
    await expect(page.getByTestId('add-talk-modal')).toBeHidden();

    // expect snackbar to be visible
    await expect(page.getByTestId('snackbar')).toBeVisible();

    // expect snackbar to have a message
    const snackbarMessage = await page
        .locator('[data-testid=snackbar]')
        .textContent();

    expect(snackbarMessage?.toLowerCase()).toContain('successfully');

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (isMobile) {
        const mobileNavigationDrawerToggle = page.locator(
            '[data-testid=mobile-navigation-drawer-toggle]',
        );
        // eslint-disable-next-line playwright/no-conditional-expect
        await expect(mobileNavigationDrawerToggle).toBeVisible();

        await mobileNavigationDrawerToggle.click();
    }

    const container = page.locator(
        isMobile
            ? '[data-testid=navigation-mobile]'
            : '[data-testid=navigation-desktop]',
    );

    const navigationTalks = container.locator('[data-navigation-slug=talks]');

    // navigate to the talks page
    await navigationTalks.click();

    // wait for the page to load
    await page.waitForURL('http://localhost:3232/');

    // wait for media-item to be visible
    await page.waitForSelector('[data-testid=media-item]', {
        timeout: 60 * 1000, // wait up to 60 seconds
    });

    // expect media-item to be visible
    const items = page.getByTestId('media-item');

    expect(await items.count()).toBeGreaterThan(0);

    // find items where data-media-item-slug matches slug
    const mediaItem = page.locator(`[data-media-item-slug=${slug}]`);

    await expect(mediaItem).toBeVisible();

    // click on the media item
    await mediaItem.click({
        delay: 80,
    });

    const mediaItemUrl = `http://localhost:3232/talks/${slug}`;

    console.info('mediaItemUrl', mediaItemUrl);

    // url should be /talks/:slug
    await page.waitForURL(mediaItemUrl, {
        timeout: 60 * 1000,
    });

    // expect data-testid=delete-talk to be visible
    const deleteTalkButton = page.locator('[data-testid=delete-talk]');

    await expect(deleteTalkButton).toBeVisible();

    // click on the button
    await deleteTalkButton.click();

    // confirmation modal should be visible
    await expect(page.getByTestId('confirmation-modal')).toBeVisible();

    // click on the confirm button
    const confirmButton = page.locator('[data-testid=confirm-button]');

    await expect(confirmButton).toBeVisible();

    await confirmButton.click({
        delay: 80,
    });

    // expect confirmation modal to be hidden
    await expect(page.getByTestId('confirmation-modal')).toBeHidden();

    // url should be talks
    await page.waitForURL('http://localhost:3232/');

    // check console logs for any errors
    const errors = logs.filter(log => log.type === 'error');

    // check if hydration errors are present
    const hydrationErrors = errors.filter(
        log =>
            log.msg.toLowerCase().includes('hydration failed') ||
            log.msg.toLowerCase().includes('minified react error #418'),
    );

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (hydrationErrors.length > 0) {
        console.error('Hydration errors found:', hydrationErrors);
    }

    expect(hydrationErrors).toHaveLength(0);
    expect(hydrationErrors).toEqual([]);
});

test('should be able to remove the root folder', async ({ page }, testInfo) => {
    test.setTimeout(60_000);

    // directly go to the media management settings page
    await page.goto(`http://localhost:3232${mediaManagementSettingsPageLink}`, {
        waitUntil: 'domcontentloaded',
    });

    // wait for 5s
    await page.waitForTimeout(5000);

    // expect media-management-settings to be visible
    await page.waitForSelector('[data-testid=media-management-settings]');

    const folderName = e2eTestFolderName(testInfo.project.name);

    const folderItem = page.locator(`[data-folder-name="${folderName}"]`);

    await expect(folderItem).toBeVisible();

    const deleteFolderButton = folderItem.locator(
        '[data-testid=delete-folder-button]',
    );

    await expect(deleteFolderButton).toBeVisible();

    // click on the remove folder button
    await deleteFolderButton.click({
        delay: 80,
        noWaitAfter: true,
    });

    // await confirmation modal
    await expect(page.getByTestId('confirmation-modal')).toBeVisible();

    // click on the confirm button
    const confirmButton = page.locator('[data-testid=confirm-button]');

    await expect(confirmButton).toBeVisible();

    await confirmButton.click({
        delay: 80,
    });

    // expect confirmation modal to be hidden
    await expect(page.getByTestId('confirmation-modal')).toBeHidden();

    // notification should be visible
    await expect(page.getByTestId('snackbar')).toBeVisible();

    // there should not be a folder item with the path
    await expect(folderItem).toBeHidden();

    // refresh page
    await page.reload();

    // should still have no root folder
    const newFolderItem = page.locator(`[data-folder-name="${folderName}"]`);

    await expect(newFolderItem).toBeHidden();
});
